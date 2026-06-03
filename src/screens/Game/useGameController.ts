import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CORRECT_PER_LEVEL_UP, MAX_MODE_LEVEL } from '../../constants/game';
import { getLevelConfig, type LevelConfig } from '../../engine/levelConfig';
import { calculateXP } from '../../engine/scorer';
import {
  playCorrectSound,
  playTickSound,
  playWrongSound,
} from '../../services/gameAudio';
import { submitValidatedScore } from '../../services/firebase/scores';
import { useGameStore, type GameStatus } from '../../stores/gameStore';
import { getSessionLives } from '../../stores/livesStore';
import { useProgressStore } from '../../stores/progressStore';
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
  getTimeLimit?: (round: TRound, config: LevelConfig) => number;
  /** Resolve per-round config mode (e.g. mix → active sub-mode). */
  getConfigMode?: (round: TRound) => GameMode;
  /** Delay before next round; defaults to interRoundDelayMs when omitted. */
  getInterRoundDelay?: (round: TRound) => number;
  /** Delay before the round timer starts (e.g. memory sequence playback). */
  getTimerStartDelay?: (round: TRound) => number;
  interRoundDelayMs?: number;
}

interface ControllerState<TRound, TAnswer> {
  round: TRound | null;
  msLeft: number;
  timeLimit: number;
  score: number;
  combo: number;
  lives: number;
  maxLives: number;
  betweenRounds: boolean;
  currentLevel: number;
  levelUpToken: number;
  submit: (answer: TAnswer | null) => void;
}

const TICK_MS = 50;
const TIMER_WARN_MS = 3000;

export function useGameController<TRound, TAnswer>(
  opts: ControllerOptions<TRound, TAnswer>,
): ControllerState<TRound, TAnswer> {
  const {
    mode,
    level: startLevel,
    generate,
    isCorrect,
    onFinish,
    getTimeLimit,
    getConfigMode,
    getInterRoundDelay,
    getTimerStartDelay,
    interRoundDelayMs = 0,
  } = opts;

  const [levelUpToken, setLevelUpToken] = useState(0);
  const currentLevel = useGameStore((s) => s.level);
  const currentLevelRef = useRef(startLevel);
  const correctSinceLevelUp = useRef(0);
  const lastTickSecond = useRef(-1);

  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const lives = useGameStore((s) => s.lives);
  const maxLives = useGameStore((s) => s.maxLives);
  const unlimitedLives = useGameStore((s) => s.unlimitedLives);
  const status = useGameStore((s) => s.status);

  const initialConfig = getLevelConfig(mode, startLevel);
  const [round, setRound] = useState<TRound | null>(null);
  const [msLeft, setMsLeft] = useState(initialConfig.timeLimit);
  const [betweenRounds, setBetweenRounds] = useState(false);

  const roundStart = useRef(Date.now());
  const timeLimitRef = useRef(initialConfig.timeLimit);
  const finished = useRef(false);
  const timeoutHandledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundRef = useRef<TRound | null>(null);
  const handleRef = useRef<(answer: TAnswer | null) => void>(() => {});
  const prevStatus = useRef<GameStatus>('idle');

  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const isActiveRun = useCallback(() => {
    const state = useGameStore.getState();
    return (
      state.mode === mode &&
      state.session !== null &&
      (state.status === 'playing' ||
        state.status === 'outOfLives' ||
        state.status === 'paused')
    );
  }, [mode]);

  const limitFor = useCallback(
    (r: TRound) => {
      const cfgMode = getConfigMode?.(r) ?? mode;
      const cfg = getLevelConfig(cfgMode, currentLevelRef.current);
      return getTimeLimit ? getTimeLimit(r, cfg) : cfg.timeLimit;
    },
    [mode, getConfigMode, getTimeLimit],
  );

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastTickSecond.current = -1;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      if (useGameStore.getState().status !== 'playing') {
        return;
      }
      const left = timeLimitRef.current - (Date.now() - roundStart.current);
      if (left <= 0) {
        setMsLeft(0);
        if (!timeoutHandledRef.current) {
          timeoutHandledRef.current = true;
          handleRef.current(null);
        }
      } else {
        setMsLeft(left);
        if (left <= TIMER_WARN_MS) {
          const sec = Math.ceil(left / 1000);
          if (sec !== lastTickSecond.current) {
            lastTickSecond.current = sec;
            playTickSound();
            if (hapticEnabled) {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }
      }
    }, TICK_MS);
  }, [hapticEnabled, stopTimer]);

  const scheduleTimerStart = useCallback(
    (r: TRound) => {
      stopTimer();
      if (timerStartTimeoutRef.current) {
        clearTimeout(timerStartTimeoutRef.current);
        timerStartTimeoutRef.current = null;
      }

      timeLimitRef.current = limitFor(r);
      setMsLeft(timeLimitRef.current);

      const begin = () => {
        roundStart.current = Date.now();
        startTimer();
      };

      const delay = getTimerStartDelay?.(r) ?? 0;
      if (delay > 0) {
        timerStartTimeoutRef.current = setTimeout(() => {
          timerStartTimeoutRef.current = null;
          begin();
        }, delay);
      } else {
        begin();
      }
    },
    [getTimerStartDelay, limitFor, startTimer, stopTimer],
  );

  const applyNextRound = useCallback(() => {
    timeoutHandledRef.current = false;
    lastTickSecond.current = -1;
    const lvl = currentLevelRef.current;
    const cfg = getLevelConfig(mode, lvl);
    const next = generate(cfg, lvl);
    setRound(next);
    scheduleTimerStart(next);
  }, [generate, mode, scheduleTimerStart]);

  const advance = useCallback(
    (options?: { immediate?: boolean }) => {
      const roundDelay =
        round && getInterRoundDelay
          ? getInterRoundDelay(round)
          : interRoundDelayMs;
      const delay =
        options?.immediate || roundDelay <= 0 ? 0 : roundDelay;

      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }

      if (delay === 0) {
        setBetweenRounds(false);
        applyNextRound();
        return;
      }

      setBetweenRounds(true);
      stopTimer();
      advanceTimeoutRef.current = setTimeout(() => {
        advanceTimeoutRef.current = null;
        setBetweenRounds(false);
        applyNextRound();
      }, delay);
    },
    [applyNextRound, getInterRoundDelay, interRoundDelayMs, round, stopTimer],
  );

  const maybeLevelUp = useCallback(() => {
    correctSinceLevelUp.current += 1;
    if (correctSinceLevelUp.current >= CORRECT_PER_LEVEL_UP) {
      correctSinceLevelUp.current = 0;
      const prev = useGameStore.getState().level;
      const next = Math.min(MAX_MODE_LEVEL, prev + 1);
      if (next > prev) {
        useGameStore.getState().bumpRunLevel();
        setLevelUpToken((token) => token + 1);
        if (hapticEnabled) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    }
  }, [hapticEnabled]);

  const doFinish = useCallback(async () => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    stopTimer();

    const finalLevel = currentLevelRef.current;
    useProgressStore.getState().recordLevel(mode, finalLevel);

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

    const levelCfg = getLevelConfig(mode, finalLevel);
    const eventComboBonus = [...events]
      .reverse()
      .find((e) => e.correct && e.comboBonus != null)?.comboBonus;
    const comboBonus = eventComboBonus ?? levelCfg.comboBonus;
    let rank: number | undefined;
    let scoreSaved = false;
    let scoreSaveReasons: string[] | undefined;
    if (state.session) {
      const cf = await submitValidatedScore(
        state.session,
        state.score,
        comboBonus,
      );
      if (cf.valid) {
        scoreSaved = true;
        rank = cf.rank ?? undefined;
      } else if (state.score > 0) {
        scoreSaveReasons = cf.reasons?.length ? cf.reasons : ['rejected'];
      }
    } else if (state.score > 0) {
      scoreSaveReasons = ['no_session'];
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
      finalLevel,
      rank,
      scoreSaved,
      scoreSaveReasons,
    });
  }, [mode, onFinish, stopTimer]);

  const handleAnswer = useCallback(
    (answer: TAnswer | null) => {
      const state = useGameStore.getState();
      if (
        finished.current ||
        state.status !== 'playing' ||
        round === null ||
        betweenRounds
      ) {
        return;
      }
      const reactionMs = Math.min(
        timeLimitRef.current,
        Date.now() - roundStart.current,
      );
      const correct = answer !== null && isCorrect(round, answer);
      const cfgMode = getConfigMode?.(round) ?? mode;
      const levelCfg = getLevelConfig(cfgMode, currentLevelRef.current);
      const tapMeta = {
        timeLimitMs: timeLimitRef.current,
        comboBonus: levelCfg.comboBonus,
      };

      if (correct) {
        if (hapticEnabled) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        }
        playCorrectSound();
        state.tapCorrect(reactionMs, tapMeta);
        maybeLevelUp();
        advance({});
        return;
      }

      if (hapticEnabled) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      }
      playWrongSound();
      correctSinceLevelUp.current = 0;
      state.tapWrong({ reactionMs, timeLimitMs: timeLimitRef.current });

      if (useGameStore.getState().status === 'outOfLives') {
        stopTimer();
        return;
      }

      advance({});
    },
    [
      advance,
      betweenRounds,
      getConfigMode,
      hapticEnabled,
      isCorrect,
      maybeLevelUp,
      mode,
      round,
      stopTimer,
    ],
  );

  handleRef.current = handleAnswer;

  useEffect(() => {
    const cleanupTimers = () => {
      stopTimer();
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      if (timerStartTimeoutRef.current) {
        clearTimeout(timerStartTimeoutRef.current);
        timerStartTimeoutRef.current = null;
      }
    };

    finished.current = false;
    timeoutHandledRef.current = false;

    if (isActiveRun()) {
      const state = useGameStore.getState();
      prevStatus.current = state.status;
      currentLevelRef.current = state.level;
      const cfg = getLevelConfig(mode, state.level);
      const resumed = generate(cfg, state.level);
      setRound(resumed);
      if (state.status === 'playing') {
        scheduleTimerStart(resumed);
      }
      return cleanupTimers;
    }

    correctSinceLevelUp.current = 0;
    prevStatus.current = 'playing';
    const isPremium = useUserStore.getState().isPremium;
    const initialLives = getSessionLives(isPremium);
    useGameStore.getState().startGame(mode, startLevel, initialLives);
    const cfg = getLevelConfig(mode, startLevel);
    const first = generate(cfg, startLevel);
    setRound(first);
    scheduleTimerStart(first);

    return cleanupTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'finished' && !finished.current) {
      void doFinish();
      return;
    }

    if (prevStatus.current === 'outOfLives' && status === 'playing') {
      timeoutHandledRef.current = false;
      lastTickSecond.current = -1;
      setBetweenRounds(false);
      const activeRound = roundRef.current;
      if (activeRound) {
        scheduleTimerStart(activeRound);
      } else {
        applyNextRound();
      }
    }

    if (status === 'outOfLives') {
      stopTimer();
    }

    prevStatus.current = status;
  }, [status, applyNextRound, doFinish, scheduleTimerStart, stopTimer]);

  return {
    round,
    msLeft,
    timeLimit: timeLimitRef.current,
    score,
    combo,
    lives: unlimitedLives ? maxLives : lives,
    maxLives,
    betweenRounds,
    currentLevel,
    levelUpToken,
    submit: (a) => handleRef.current(a),
  };
}
