import { doc, getDoc } from 'firebase/firestore';

import { firestore } from '../../lib/firebase';
import {
  DEFAULT_REMOTE_CONFIG,
  type RemoteConfigValues,
} from '../../types/remoteConfig';

const CONFIG_PATH = 'config/app';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

let cached: RemoteConfigValues = { ...DEFAULT_REMOTE_CONFIG };
let lastFetchedAt = 0;

/** Synchronous read of the in-memory cache (defaults until first fetch). */
export function getRemoteConfig(): RemoteConfigValues {
  return cached;
}

export function getLastFetchedAt(): number {
  return lastFetchedAt;
}

export function isConfigStale(): boolean {
  return Date.now() - lastFetchedAt > TWELVE_HOURS_MS;
}

function mergeConfig(raw: Record<string, unknown> | null): RemoteConfigValues {
  if (!raw) {
    return { ...DEFAULT_REMOTE_CONFIG };
  }
  const out = { ...DEFAULT_REMOTE_CONFIG };
  for (const key of Object.keys(DEFAULT_REMOTE_CONFIG) as (keyof RemoteConfigValues)[]) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = v;
    }
  }
  return out;
}

/**
 * Loads `config/app` from Firestore and updates the in-memory cache.
 * Safe to call repeatedly; skips network when not stale unless `force` is true.
 */
export async function fetchRemoteConfig(force = false): Promise<RemoteConfigValues> {
  if (!force && !isConfigStale() && lastFetchedAt > 0) {
    return cached;
  }
  try {
    const snap = await getDoc(doc(firestore, CONFIG_PATH));
    cached = mergeConfig(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
    lastFetchedAt = Date.now();
  } catch {
    // Keep previous cache / defaults on failure.
    if (lastFetchedAt === 0) {
      cached = { ...DEFAULT_REMOTE_CONFIG };
    }
  }
  return cached;
}

/** Hydrates cache from persisted store values (app restart). */
export function hydrateRemoteConfig(
  values: RemoteConfigValues,
  fetchedAt: number | null,
): void {
  cached = { ...DEFAULT_REMOTE_CONFIG, ...values };
  if (fetchedAt) {
    lastFetchedAt = fetchedAt;
  }
}
