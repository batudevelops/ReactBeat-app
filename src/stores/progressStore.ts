import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { MAX_MODE_LEVEL } from '../constants/game';
import type { GameMode } from '../types/game';
import { GAME_MODES } from '../types/game';

type LevelMap = Record<GameMode, number>;

const DEFAULT_LEVELS: LevelMap = {
  reflex: 1,
  memory: 1,
  pattern: 1,
  colorConflict: 1,
  oddOneOut: 1,
  mathSnap: 1,
  direction: 1,
  mix: 1,
};

interface ProgressState {
  levelByMode: LevelMap;
  getLevel: (mode: GameMode) => number;
  /** Persist the highest level reached for a mode. */
  recordLevel: (mode: GameMode, level: number) => void;
  /** Reset a mode back to level 1 (player-initiated). */
  resetLevel: (mode: GameMode) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      levelByMode: { ...DEFAULT_LEVELS },

      getLevel: (mode) => get().levelByMode[mode] ?? 1,

      recordLevel: (mode, level) => {
        const clamped = Math.max(1, Math.min(MAX_MODE_LEVEL, level));
        set((s) => ({
          levelByMode: {
            ...s.levelByMode,
            [mode]: Math.max(s.levelByMode[mode] ?? 1, clamped),
          },
        }));
      },

      resetLevel: (mode) => {
        set((s) => ({
          levelByMode: {
            ...s.levelByMode,
            [mode]: 1,
          },
        }));
      },
    }),
    {
      name: 'reactbeat-progress',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<ProgressState> | undefined;
        const merged = { ...DEFAULT_LEVELS, ...p?.levelByMode };
        for (const mode of GAME_MODES) {
          if (!merged[mode] || merged[mode] < 1) {
            merged[mode] = 1;
          }
        }
        return { ...current, levelByMode: merged };
      },
    },
  ),
);

export function getStartLevel(mode: GameMode): number {
  return useProgressStore.getState().getLevel(mode);
}
