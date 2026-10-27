import { getFirestore } from 'firebase-admin/firestore';

/**
 * Server-side read of the scoring knobs that MUST stay in sync with the client
 * (`src/engine/scorer.ts` reads the same `config/app` doc via Remote Config).
 * Cached per instance to avoid a Firestore read on every score submission.
 */
export const DEFAULT_COMBO_MULTIPLIER_STEP = 0.1;

const CONFIG_PATH = 'config/app';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedStep = DEFAULT_COMBO_MULTIPLIER_STEP;
let fetchedAt = 0;

/** Combo multiplier step from `config/app`, matching the client formula. */
export async function getComboMultiplierStep(): Promise<number> {
  const now = Date.now();
  if (fetchedAt > 0 && now - fetchedAt < CACHE_TTL_MS) {
    return cachedStep;
  }
  try {
    const snap = await getFirestore().doc(CONFIG_PATH).get();
    const value = snap.data()?.combo_multiplier_step;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      cachedStep = value;
    }
    fetchedAt = now;
  } catch {
    // Keep the previous cache / default on failure.
  }
  return cachedStep;
}
