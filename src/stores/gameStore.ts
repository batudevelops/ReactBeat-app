import { create } from 'zustand';

import { createSession } from '../engine/antiCheat';
import { getLevelConfig } from '../engine/levelConfig';
import { calculateScore } from '../engine/scorer';
import { MAX_MODE_LEVEL } from '../constants/game';
import { DEFAULT_LIVES, PREMIUM_LIVES } from '../constants/monetization';
import type { GameMode } from '../types/game';
import type { GameSession, TapEvent } from '../types/session';
import { MAX_LIVES, useLivesStore } from './livesStore';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'outOfLives' | 'finished';

interface GameState {
  mode: GameMode | null;
  level: number;
  score: number;
  combo: number;
  streak: number;
  lives: number;
  maxLives: number;
  unlimitedLives: boolean;
  /** True after the one allowed in-run ad continue was used this session. */
  adContinueUsed: boolean;
  status: GameStatus;
  session: GameSession | null;

  startGame: (mode: GameMode, level: number, initialLives?: number) => void;
  tapCorrect: (reactionMs: number, detail?: Partial<TapEvent>) => void;
  tapWrong: (detail?: Partial<TapEvent>) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resumeWithOneLife: () => void;
  bumpRunLevel: () => void;
  endGame: () => void;
  reset: () => void;
}

const idleState = {
  mode: null,
  level: 1,
  score: 0,
  combo: 0,
  streak: 0,
  lives: DEFAULT_LIVES,
  maxLives: DEFAULT_LIVES,
  unlimitedLives: false,
  adContinueUsed: false,
  status: 'idle' as GameStatus,
  session: null,
};

export const useGameStore = create<GameState>((set, _get) => ({
  ...idleState,

  startGame: (mode, level, initialLives = DEFAULT_LIVES) => {
    const unlimitedLives = initialLives >= PREMIUM_LIVES;
    const runLives = unlimitedLives ? DEFAULT_LIVES : initialLives;
    const maxLives = unlimitedLives
      ? DEFAULT_LIVES
      : Math.max(DEFAULT_LIVES, Math.min(MAX_LIVES, initialLives));
    set({
      mode,
      level,
      score: 0,
      combo: 0,
      streak: 0,
      lives: runLives,
      maxLives,
      unlimitedLives,
      adContinueUsed: false,
      status: 'playing',
      session: createSession(mode, level),
    });
  },

  tapCorrect: (reactionMs, detail) =>
    set((s) => {
      const cfg = s.mode ? getLevelConfig(s.mode, s.level) : null;
      const timeLimit = detail?.timeLimitMs ?? cfg?.timeLimit ?? 2000;
      const comboBonus = detail?.comboBonus ?? cfg?.comboBonus ?? 10;
      const event: TapEvent = {
        ts: Date.now(),
        questionId: detail?.questionId ?? '',
        answer: detail?.answer ?? '',
        correct: true,
        reactionMs,
        timeLimitMs: timeLimit,
        comboBonus,
      };
      const points = calculateScore({
        correct: true,
        reactionMs,
        timeLimit,
        combo: s.combo,
        comboBonus,
      });
      return {
        score: s.score + points,
        combo: s.combo + 1,
        streak: s.streak + 1,
        session: s.session
          ? { ...s.session, events: [...s.session.events, event] }
          : s.session,
      };
    }),

  tapWrong: (detail) =>
    set((s) => {
      const event: TapEvent = {
        ts: Date.now(),
        questionId: detail?.questionId ?? '',
        answer: detail?.answer ?? '',
        correct: false,
        reactionMs: detail?.reactionMs ?? 0,
        timeLimitMs: detail?.timeLimitMs,
      };
      if (s.unlimitedLives) {
        return {
          combo: 0,
          session: s.session
            ? { ...s.session, events: [...s.session.events, event] }
            : s.session,
        };
      }
      useLivesStore.getState().loseLife();
      const lives = Math.max(0, s.lives - 1);
      const outOfLives = lives === 0;
      return {
        lives,
        combo: 0,
        status: outOfLives ? 'outOfLives' : s.status,
        session: s.session
          ? { ...s.session, events: [...s.session.events, event] }
          : s.session,
      };
    }),

  pauseGame: () =>
    set((s) => (s.status === 'playing' ? { status: 'paused' } : s)),

  resumeGame: () =>
    set((s) => (s.status === 'paused' ? { status: 'playing' } : s)),

  resumeWithOneLife: () =>
    set((s) =>
      s.status === 'outOfLives'
        ? { lives: 1, status: 'playing', adContinueUsed: true }
        : s,
    ),

  bumpRunLevel: () =>
    set((s) => ({
      level: Math.min(MAX_MODE_LEVEL, s.level + 1),
    })),

  endGame: () =>
    set((s) => ({
      status: 'finished',
      session: s.session ? { ...s.session, endTime: Date.now() } : s.session,
    })),

  reset: () => set({ ...idleState }),
}));
