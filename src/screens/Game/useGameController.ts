import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getLevelConfig, type LevelConfig } from '../../engine/levelConfig';
import { calculateXP } from '../../engine/scorer';
import { DEFAULT_LIVES, PREMIUM_LIVES } from '../../constants/monetization';
import { submitValidatedScore } from '../../services/firebase/scores';
import { useGameStore } from '../../stores/gameStore';
import { useMonetizationStore } from '../../stores/monetizationStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUserStore } from '../../stores/userStore';
import type { GameMode } from '../../types/game';
import type { GameResult } from './types';

interface ControllerOptions<TRound, TAnswer> {
  mode: GameMode;
  level: number;
  generate: (config: LevelConfig, level: number) => TRound;
  isCorrect: (round: TRound, answer: TAnswer) => boolean;
  onFinish: (result: GameResult) => void;
  /** Optional per-round time budget (ms); defaults to the level config timeLimit. */
  getTimeLimit?: (round: TRound, config: LevelConfig) => number;
}

interface ControllerState<TRound, TAnswer> {
  round: TRound | null;
  msLeft: number;
  timeLimit: number;
  score: number;
  combo: number;
  lives: number;
  maxLives: number;
  submit: (answer: TAnswer | null) => void;
}

const TICK_MS = 50;

export function useGameController<TRound, TAnswer>(
  opts: ControllerOptions<TRound, TAnswer>,
): ControllerState<TRound, TAnswer> {
  const { mode, level, generate, isCorrect, onFinish, getTimeLimit } = opts;
  const config = getLevelConfig(mode, level);

  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const lives = useGameStore((s) => s.lives);
  const maxLives = useGameStore((s) => s.maxLives);
  const unlimitedLives = useGameStore((s) => s.unlimitedLives);

  const [round, setRound] = useState<TRound | null>(null);
  const [msLeft, setMsLeft] = useState(config.timeLimit);

  const roundStart = useRef(Date.now());
  const timeLimitRef = useRef(config.timeLimit);
  const finished = useRef(false);
  const timeoutHandledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleRef = useRef<(answer: TAnswer | null) => void>(() => {});

  const hapticEnabled = useSettingsStore.getState().hapticEnabled;

  const limitFor = useCallback(
    (r: TRound) => (getTimeLimit ? getTimeLimit(r, config) : config.timeLimit),
    [config, getTimeLimit],
  );

  const advance = useCallback(() => {
    timeoutHandledRef.current = false;
    const next = generate(config, level);
    roundStart.current = Date.now();
    timeLimitRef.current = limitFor(next);
    setRound(next);
    setMsLeft(timeLimitRef.current);
  }, [config, generate, level, limitFor]);

  const doFinish = useCallback(async () => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const state = useGameStore.getState();
    const events = state.session?.events ?? [];
    const correct = events.filter((e) => e.correct).length;
    const wrong = events.length - correct;
    const avgReactionMs = correct
      ? Math.round(
          events
            .filter((e) => e.correct)
            .reduce((sum, e) => sum + e.reactionMs, 0) / correct,
        )
      : 0;

    const levelCfg = getLevelConfig(mode, level);
    let rank: number | undefined;
    let scoreSaved = false;
    if (state.session) {
      const cf = await submitValidatedScore(
        state.session,
        state.score,
        levelCfg.comboBonus,
      );
      if (cf?.valid) {
        scoreSaved = true;
        rank = cf.rank ?? undefined;
      }
    }

    const user = useUserStore.getState();
    const isNewRecord = state.score > (user.bestScores[mode] ?? 0);
    user.updateBestScore(mode, state.score);
    user.setUser({
      totalGames: user.totalGames + 1,
      totalXP: user.totalXP + calculateXP(state.score),
      lastPlayedAt: new Date().toISOString(),
    });

    onFinish({
      score: state.score,
      isNewRecord,
      correct,
      wrong,
      avgReactionMs,
      rank,
      scoreSaved,
    });
  }, [mode, level, onFinish]);

  const handleAnswer = useCallback(
    (answer: TAnswer | null) => {
      const state = useGameStore.getState();
      if (finished.current || state.status !== 'playing' || round === null) {
        return;
      }
      const reactionMs = Math.min(
        timeLimitRef.current,
        Date.now() - roundStart.current,
      );
      const correct = answer !== null && isCorrect(round, answer);

      if (correct) {
        if (hapticEnabled) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        }
        state.tapCorrect(reactionMs);
      } else {
        if (hapticEnabled) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
        }
        state.tapWrong({ reactionMs });
      }

      if (useGameStore.getState().status === 'finished') {
        doFinish();
      } else {
        advance();
      }
    },
    [advance, config.timeLimit, doFinish, hapticEnabled, isCorrect, round],
  );

  handleRef.current = handleAnswer;

  // Start the game + first round once.
  useEffect(() => {
    const isPremium = useUserStore.getState().isPremium;
    const bonusLives = useMonetizationStore.getState().bonusLives;
    const initialLives = isPremium
      ? PREMIUM_LIVES
      : DEFAULT_LIVES + bonusLives;
    if (bonusLives > 0 && !isPremium) {
      useMonetizationStore.getState().clearBonusLives();
    }
    useGameStore.getState().startGame(mode, level, initialLives);
    finished.current = false;
    timeoutHandledRef.current = false;
    const first = generate(config, level);
    roundStart.current = Date.now();
    timeLimitRef.current = limitFor(first);
    setRound(first);
    setMsLeft(timeLimitRef.current);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      useGameStore.getState().reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown loop; a timed-out question counts as wrong.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const left = timeLimitRef.current - (Date.now() - roundStart.current);
      if (left <= 0) {
        setMsLeft(0);
        if (!timeoutHandledRef.current) {
          timeoutHandledRef.current = true;
          handleRef.current(null);
        }
      } else {
        setMsLeft(left);
      }
    }, TICK_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    round,
    msLeft,
    timeLimit: timeLimitRef.current,
    score,
    combo,
    lives: unlimitedLives ? maxLives : lives,
    maxLives,
    submit: (a) => handleRef.current(a),
  };
}
