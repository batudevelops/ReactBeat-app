import { create } from 'zustand';

import { createSession } from '../engine/antiCheat';
import { getLevelConfig } from '../engine/levelConfig';
import { calculateScore } from '../engine/scorer';
import { DEFAULT_LIVES, PREMIUM_LIVES } from '../constants/monetization';
import type { GameMode } from '../types/game';
import type { GameSession, TapEvent } from '../types/session';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

interface GameState {
  mode: GameMode | null;
  level: number;
  score: number;
  combo: number;
  streak: number;
  lives: number;
  maxLives: number;
  unlimitedLives: boolean;
  status: GameStatus;
  session: GameSession | null;

  startGame: (mode: GameMode, level: number, initialLives?: number) => void;
  tapCorrect: (reactionMs: number, detail?: Partial<TapEvent>) => void;
  tapWrong: (detail?: Partial<TapEvent>) => void;
  pauseGame: () => void;
  resumeGame: () => void;
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
  status: 'idle' as GameStatus,
  session: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...idleState,

  startGame: (mode, level, initialLives = DEFAULT_LIVES) => {
    const unlimitedLives = initialLives >= PREMIUM_LIVES;
    const maxLives = unlimitedLives ? DEFAULT_LIVES : initialLives;
    set({
      mode,
      level,
      score: 0,
      combo: 0,
      streak: 0,
      lives: initialLives,
      maxLives,
      unlimitedLives,
      status: 'playing',
      session: createSession(mode, level),
    });
  },

  tapCorrect: (reactionMs, detail) =>
    set((s) => {
      const event: TapEvent = {
        ts: Date.now(),
        questionId: detail?.questionId ?? '',
        answer: detail?.answer ?? '',
        correct: true,
        reactionMs,
      };
      const cfg = s.mode ? getLevelConfig(s.mode, s.level) : null;
      const points = cfg
        ? calculateScore({
            correct: true,
            reactionMs,
            timeLimit: cfg.timeLimit,
            combo: s.combo,
            comboBonus: cfg.comboBonus,
          })
        : 100;
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
      };
      if (s.unlimitedLives) {
        return {
          combo: 0,
          session: s.session
            ? { ...s.session, events: [...s.session.events, event] }
            : s.session,
        };
      }
      const lives = Math.max(0, s.lives - 1);
      const finished = lives === 0;
      return {
        lives,
        combo: 0,
        status: finished ? 'finished' : s.status,
        session: s.session
          ? {
              ...s.session,
              events: [...s.session.events, event],
              endTime: finished ? Date.now() : s.session.endTime,
            }
          : s.session,
      };
    }),

  pauseGame: () =>
    set((s) => (s.status === 'playing' ? { status: 'paused' } : s)),

  resumeGame: () =>
    set((s) => (s.status === 'paused' ? { status: 'playing' } : s)),

  endGame: () =>
    set((s) => ({
      status: 'finished',
      session: s.session ? { ...s.session, endTime: Date.now() } : s.session,
    })),

  reset: () => set({ ...idleState }),
}));
