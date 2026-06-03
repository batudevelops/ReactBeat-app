import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { DEFAULT_LIVES } from '../constants/monetization';
import {
  getMsUntilNextLife,
  MAX_LIVES,
  useLivesStore,
} from '../stores/livesStore';

/** Format ms as M:SS (or H:MM:SS when over an hour). */
export function formatLifeRegenCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Keeps natural life regen in sync while the UI is visible. */
export function useLivesRegen() {
  const remaining = useLivesStore((s) => s.remaining);
  const nextLifeAt = useLivesStore((s) => s.nextLifeAt);
  const syncRegen = useLivesStore((s) => s.syncRegen);
  const [, setTick] = useState(0);

  useEffect(() => {
    syncRegen();
  }, [syncRegen]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncRegen();
        setTick((n) => n + 1);
      }
    });
    return () => sub.remove();
  }, [syncRegen]);

  useEffect(() => {
    if (nextLifeAt === null || remaining >= DEFAULT_LIVES) {
      return;
    }
    syncRegen();
    const id = setInterval(() => {
      syncRegen();
      setTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [nextLifeAt, remaining, syncRegen]);

  const msUntilNext = getMsUntilNextLife();

  return {
    remaining,
    regenCap: DEFAULT_LIVES,
    maxLives: MAX_LIVES,
    msUntilNext,
    regenCountdown:
      msUntilNext !== null ? formatLifeRegenCountdown(msUntilNext) : null,
  };
}
