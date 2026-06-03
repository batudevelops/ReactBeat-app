import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  BONUS_LIFE_FROM_AD,
  DEFAULT_LIVES,
  LIFE_REGEN_MS,
  PREMIUM_LIVES,
} from '../constants/monetization';

/** Max lives after rewarded ads (base + ad bonus). */
export const MAX_LIVES = DEFAULT_LIVES + BONUS_LIFE_FROM_AD;

/** Lives refill naturally up to this count; ad can push one above. */
export const REGEN_CAP = DEFAULT_LIVES;

interface LivesState {
  remaining: number;
  /** Timestamp when the next natural life arrives; null when at/above regen cap. */
  nextLifeAt: number | null;
  loseLife: () => number;
  addLife: (count?: number) => number;
  /** Apply elapsed regen timers (call on app focus and UI ticks). */
  syncRegen: (now?: number) => void;
}

function applyRegen(
  remaining: number,
  nextLifeAt: number | null,
  now: number,
): { remaining: number; nextLifeAt: number | null } {
  let r = remaining;
  let t = nextLifeAt;

  while (r < REGEN_CAP && t !== null && now >= t) {
    r += 1;
    t = r < REGEN_CAP ? t + LIFE_REGEN_MS : null;
  }

  return { remaining: r, nextLifeAt: t };
}

function scheduleRegen(
  remaining: number,
  nextLifeAt: number | null,
  wasAtRegenCap: boolean,
  now: number,
): number | null {
  if (remaining >= REGEN_CAP) {
    return null;
  }
  if (wasAtRegenCap || nextLifeAt === null) {
    return now + LIFE_REGEN_MS;
  }
  return nextLifeAt;
}

export const useLivesStore = create<LivesState>()(
  persist(
    (set, get) => ({
      remaining: DEFAULT_LIVES,
      nextLifeAt: null,

      syncRegen: (now = Date.now()) => {
        const { remaining, nextLifeAt } = get();
        const synced = applyRegen(remaining, nextLifeAt, now);
        if (
          synced.remaining !== remaining ||
          synced.nextLifeAt !== nextLifeAt
        ) {
          set(synced);
        }
      },

      loseLife: () => {
        const now = Date.now();
        const { remaining, nextLifeAt } = get();
        const synced = applyRegen(remaining, nextLifeAt, now);
        const wasAtRegenCap = synced.remaining >= REGEN_CAP;
        const next = Math.max(0, synced.remaining - 1);
        const newNextLifeAt = scheduleRegen(
          next,
          synced.nextLifeAt,
          wasAtRegenCap,
          now,
        );
        set({ remaining: next, nextLifeAt: newNextLifeAt });
        return next;
      },

      addLife: (count = BONUS_LIFE_FROM_AD) => {
        const now = Date.now();
        const { remaining, nextLifeAt } = get();
        const synced = applyRegen(remaining, nextLifeAt, now);
        const next = Math.min(MAX_LIVES, synced.remaining + count);
        set({
          remaining: next,
          nextLifeAt: next >= REGEN_CAP ? null : synced.nextLifeAt,
        });
        return next;
      },
    }),
    {
      name: 'reactbeat-lives',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<LivesState> | undefined;
        let remaining =
          typeof p?.remaining === 'number' ? p.remaining : DEFAULT_LIVES;
        let nextLifeAt = p?.nextLifeAt ?? null;

        // Bump users who were at the old life caps to the new default.
        if (remaining <= 5 && nextLifeAt === null && remaining < DEFAULT_LIVES) {
          remaining = DEFAULT_LIVES;
        }

        const synced = applyRegen(remaining, nextLifeAt, Date.now());
        return { ...current, ...synced };
      },
    },
  ),
);

/** Lives passed into a new game session (premium = unlimited sentinel). */
export function getSessionLives(isPremium: boolean): number {
  if (isPremium) {
    return PREMIUM_LIVES;
  }
  useLivesStore.getState().syncRegen();
  return useLivesStore.getState().remaining;
}

export function hasLivesToPlay(isPremium: boolean): boolean {
  if (isPremium) {
    return true;
  }
  useLivesStore.getState().syncRegen();
  return useLivesStore.getState().remaining > 0;
}

export function getMsUntilNextLife(now = Date.now()): number | null {
  useLivesStore.getState().syncRegen(now);
  const { remaining, nextLifeAt } = useLivesStore.getState();
  if (remaining >= REGEN_CAP || nextLifeAt === null) {
    return null;
  }
  return Math.max(0, nextLifeAt - now);
}
