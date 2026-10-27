import { DEFAULT_COMBO_MULTIPLIER_STEP } from './config';
import type { GameSession } from './types';

export interface ScoreParams {
  correct: boolean;
  reactionMs: number;
  timeLimit: number;
  combo: number;
  comboBonus: number;
}

const BASE_SCORE = 100;
const MAX_SPEED_BONUS = 50;

/**
 * Per-question score (§8). MUST mirror `src/engine/scorer.ts` on the client.
 * `comboMultiplierStep` comes from `config/app` so both sides use one source.
 */
export function calculateScore(
  params: ScoreParams,
  comboMultiplierStep: number = DEFAULT_COMBO_MULTIPLIER_STEP,
): number {
  if (!params.correct) {
    return 0;
  }
  const speedRatio = 1 - params.reactionMs / params.timeLimit;
  const speedBonus = Math.floor(clamp01(speedRatio) * MAX_SPEED_BONUS);
  const comboMultiplier = 1 + params.combo * comboMultiplierStep;
  const flatComboBonus = params.combo * params.comboBonus;
  return Math.floor((BASE_SCORE + speedBonus) * comboMultiplier) + flatComboBonus;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Replays tap events in order to compute the authoritative session score. */
export function scoreFromSession(
  session: GameSession,
  defaultComboBonus: number,
  comboMultiplierStep: number = DEFAULT_COMBO_MULTIPLIER_STEP,
): number {
  let combo = 0;
  let total = 0;
  for (const event of session.events) {
    if (!event.correct) {
      combo = 0;
      continue;
    }
    const timeLimit = event.timeLimitMs ?? 2000;
    const comboBonus = event.comboBonus ?? defaultComboBonus;
    total += calculateScore(
      {
        correct: true,
        reactionMs: event.reactionMs,
        timeLimit,
        combo,
        comboBonus,
      },
      comboMultiplierStep,
    );
    combo += 1;
  }
  return total;
}
