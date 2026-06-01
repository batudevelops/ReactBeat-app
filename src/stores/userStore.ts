import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GameMode } from '../types/game';
import { EMPTY_BEST_SCORES } from '../types/user';

interface UserState {
  uid: string | null;
  displayName: string;
  avatar: number;
  isAnonymous: boolean;
  isPremium: boolean;

  bestScores: Record<GameMode, number>;
  totalGames: number;
  totalXP: number;
  streak: number;
  lastPlayedAt: string | null;

  setUser: (user: Partial<UserState>) => void;
  updateBestScore: (mode: GameMode, score: number) => void;
  setPremium: (val: boolean) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  clear: () => void;
}

const initialState = {
  uid: null,
  displayName: '',
  avatar: 0,
  isAnonymous: true,
  isPremium: false,
  bestScores: { ...EMPTY_BEST_SCORES },
  totalGames: 0,
  totalXP: 0,
  streak: 0,
  lastPlayedAt: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set((s) => ({ ...s, ...user })),

      updateBestScore: (mode, score) =>
        set((s) =>
          score > s.bestScores[mode]
            ? { bestScores: { ...s.bestScores, [mode]: score } }
            : s,
        ),

      setPremium: (val) => set({ isPremium: val }),

      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),

      clear: () => set({ ...initialState, bestScores: { ...EMPTY_BEST_SCORES } }),
    }),
    {
      name: 'braintap.user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
