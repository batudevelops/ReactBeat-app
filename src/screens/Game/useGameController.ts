import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getLevelConfig, type LevelConfig } from '../../engine/levelConfig';
import { calculateXP } from '../../engine/scorer';
import { useGameStore } from '../../stores/gameStore';
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
}

interface ControllerState<TRound, TAnswer> {
  round: TRound | null;
  msLeft: number;
  timeLimit: number;
  score: number;
  combo: number;
  lives: number;
  submit: (answer: TAnswer | null) => void;
}

const TICK_MS = 50;

export function useGameController<TRound, TAnswer>(
  opts: ControllerOptions<TRound, TAnswer>,
): ControllerState<TRound, TAnswer> {
  const { mode, level, generate, isCorrect, onFinish } = opts;
  const config = getLevelConfig(mode, level);

  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const lives = useGameStore((s) => s.lives);

  const [round, setRound] = useState<TRound | null>(null);
  const [msLeft, setMsLeft] = useState(config.timeLimit);

  const roundStart = useRef(Date.now());
  const finished = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleRef = useRef<(answer: TAnswer | null) => void>(() => {});

  const hapticEnabled = useSettingsStore.getState().hapticEnabled;

  const advance = useCallback(() => {
    roundStart.current = Date.now();
    setRound(generate(config, level));
    setMsLeft(config.timeLimit);
  }, [config, generate, level]);

  const doFinish = useCallback(() => {
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

    const user = useUserStore.getState();
    const isNewRecord = state.score > (user.bestScores[mode] ?? 0);
    user.updateBestScore(mode, state.score);
    user.setUser({
      totalGames: user.totalGames + 1,
      totalXP: user.totalXP + calculateXP(state.score),
      lastPlayedAt: new Date().toISOString(),
    });

    onFinish({ score: state.score, isNewRecord, correct, wrong, avgReactionMs });
  }, [mode, onFinish]);

  const handleAnswer = useCallback(
    (answer: TAnswer | null) => {
      const state = useGameStore.getState();
      if (finished.current || state.status !== 'playing' || round === null) {
        return;
      }
      const reactionMs = Math.min(
        config.timeLimit,
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
    useGameStore.getState().startGame(mode, level);
    finished.current = false;
    roundStart.current = Date.now();
    setRound(generate(config, level));
    setMsLeft(config.timeLimit);

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
      const left = config.timeLimit - (Date.now() - roundStart.current);
      if (left <= 0) {
        handleRef.current(null);
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

  return { round, msLeft, timeLimit: config.timeLimit, score, combo, lives, submit: (a) => handleRef.current(a) };
}
