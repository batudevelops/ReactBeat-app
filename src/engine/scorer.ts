export interface ScoreParams {
  correct: boolean;
  reactionMs: number;
  timeLimit: number;
  combo: number;
  comboBonus: number;
}

const BASE_SCORE = 100;
const MAX_SPEED_BONUS = 50;
const COMBO_MULTIPLIER_STEP = 0.1; // §18 combo_multiplier_step

/**
 * Per-question score (§8).
 *   base + speed bonus, scaled by the combo multiplier, plus a flat combo bonus.
 * Wrong answers score 0.
 */
export function calculateScore(params: ScoreParams): number {
  if (!params.correct) {
    return 0;
  }
  const speedRatio = 1 - params.reactionMs / params.timeLimit;
  const speedBonus = Math.floor(clamp01(speedRatio) * MAX_SPEED_BONUS);
  const comboMultiplier = 1 + params.combo * COMBO_MULTIPLIER_STEP;
  const flatComboBonus = params.combo * params.comboBonus;
  return Math.floor((BASE_SCORE + speedBonus) * comboMultiplier) + flatComboBonus;
}

/** XP earned for a finished game; simple 1 XP per 10 points. */
export function calculateXP(score: number): number {
  return Math.floor(Math.max(0, score) / 10);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
