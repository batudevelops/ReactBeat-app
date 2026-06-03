import type { GameSession } from './types';
import { calculateScore } from './scorer';

export const MIN_HUMAN_REACTION_MS = 80;
const IDENTICAL_TIMING_MIN_SAMPLES = 5;

export function theoreticalMaxScore(session: GameSession, comboBonus = 0): number {
  let combo = 0;
  let total = 0;
  for (const event of session.events) {
    if (!event.correct) {
      combo = 0;
      continue;
    }
    const timeLimit = event.timeLimitMs ?? 2000;
    const eventComboBonus = event.comboBonus ?? comboBonus;
    total += calculateScore({
      correct: true,
      reactionMs: 0,
      timeLimit,
      combo,
      comboBonus: eventComboBonus,
    });
    combo += 1;
  }
  return total;
}

export function validateSession(
  session: GameSession,
  claimedScore: number,
  comboBonus = 0,
): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const correctEvents = session.events.filter((e) => e.correct);

  if (correctEvents.some((e) => e.reactionMs > 0 && e.reactionMs < MIN_HUMAN_REACTION_MS)) {
    reasons.push('reaction_too_fast');
  }

  if (correctEvents.length >= IDENTICAL_TIMING_MIN_SAMPLES) {
    const first = correctEvents[0].reactionMs;
    if (correctEvents.every((e) => e.reactionMs === first)) {
      reasons.push('identical_timing');
    }
  }

  if (claimedScore > theoreticalMaxScore(session, comboBonus)) {
    reasons.push('score_exceeds_max');
  }

  const duration = (session.endTime || Date.now()) - session.startTime;
  const totalReaction = session.events.reduce((sum, e) => sum + Math.max(0, e.reactionMs), 0);
  if (duration > 0 && duration < totalReaction) {
    reasons.push('duration_too_short');
  }

  if (claimedScore > 0 && session.events.length === 0) {
    reasons.push('event_score_mismatch');
  }

  const correctCount = correctEvents.length;
  if (claimedScore > 0 && correctCount === 0) {
    reasons.push('no_correct_events');
  }

  return { valid: reasons.length === 0, reasons };
}
