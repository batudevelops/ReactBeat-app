import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { create } from 'zustand';

import type { GameMode } from '../types/game';
import type { GameSession, TapEvent } from '../types/session';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

const DEFAULT_LIVES = 3;
const BASE_POINTS = 100;
const COMBO_BONUS = 10;

interface GameState {
  mode: GameMode | null;
  level: number;
  score: number;
  combo: number;
  streak: number;
  lives: number;
  status: GameStatus;
  session: GameSession | null;

  startGame: (mode: GameMode, level: number) => void;
  tapCorrect: (reactionMs: number, detail?: Partial<TapEvent>) => void;
  tapWrong: (detail?: Partial<TapEvent>) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  reset: () => void;
}

function deviceFingerprint(): string {
  return `${Platform.OS}/${Constants.deviceName ?? 'unknown'}`;
}

const idleState = {
  mode: null,
  level: 1,
  score: 0,
  combo: 0,
  streak: 0,
  lives: DEFAULT_LIVES,
  status: 'idle' as GameStatus,
  session: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...idleState,

  startGame: (mode, level) =>
    set({
      mode,
      level,
      score: 0,
      combo: 0,
      streak: 0,
      lives: DEFAULT_LIVES,
      status: 'playing',
      session: {
        sessionId: Crypto.randomUUID(),
        mode,
        level,
        startTime: Date.now(),
        endTime: 0,
        deviceFingerprint: deviceFingerprint(),
        events: [],
      },
    }),

  tapCorrect: (reactionMs, detail) =>
    set((s) => {
      const event: TapEvent = {
        ts: Date.now(),
        questionId: detail?.questionId ?? '',
        answer: detail?.answer ?? '',
        correct: true,
        reactionMs,
      };
      return {
        score: s.score + BASE_POINTS + s.combo * COMBO_BONUS,
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
