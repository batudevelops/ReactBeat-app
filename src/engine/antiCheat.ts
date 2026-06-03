import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import type { GameMode } from '../types/game';
import type { GameSession, TapEvent } from '../types/session';
import { calculateScore } from './scorer';

/** Human reaction floor; taps faster than this look automated (§13, kontrol 1). */
export const MIN_HUMAN_REACTION_MS = 80;
const IDENTICAL_TIMING_MIN_SAMPLES = 5;

export function deviceFingerprint(): string {
  return `${Platform.OS}/${Constants.deviceName ?? 'unknown'}`;
}

export function createSession(mode: GameMode, level: number): GameSession {
  return {
    sessionId: Crypto.randomUUID(),
    mode,
    level,
    startTime: Date.now(),
    endTime: 0,
    deviceFingerprint: deviceFingerprint(),
    events: [],
  };
}

export function addEvent(session: GameSession, event: TapEvent): GameSession {
  return { ...session, events: [...session.events, event] };
}

export function finalizeSession(session: GameSession): GameSession {
  return { ...session, endTime: session.endTime || Date.now() };
}

export interface AntiCheatInput {
  /** Score the client claims it earned, cross-checked against the theoretical max. */
  claimedScore?: number;
  /** comboBonus from the level config, needed to recompute the theoretical max. */
  comboBonus?: number;
}

export interface AntiCheatResult {
  valid: boolean;
  reasons: string[];
}

/**
 * Best-case score achievable for the correct taps in this session (instant
 * reactions, monotonically increasing combo). Used by check 3.
 */
export function theoreticalMaxScore(
  session: GameSession,
  comboBonus = 0,
): number {
  let combo = 0;
  let total = 0;
  for (const event of session.events) {
    if (!event.correct) {
      combo = 0;
      continue;
    }
    total += calculateScore({
      correct: true,
      reactionMs: 0,
      timeLimit: event.timeLimitMs ?? 2000,
      combo,
      comboBonus: event.comboBonus ?? comboBonus,
    });
    combo += 1;
  }
  return total;
}

/**
 * Runs the five client-side heuristics from §13. The authoritative check lives
 * in the Cloud Function (Faz 8); this mirrors it for fast local feedback/tests.
 */
export function validateSession(
  session: GameSession,
  input: AntiCheatInput = {},
): AntiCheatResult {
  const reasons: string[] = [];
  const correctEvents = session.events.filter((e) => e.correct);

  // 1) Inhumanly fast taps.
  if (correctEvents.some((e) => e.reactionMs > 0 && e.reactionMs < MIN_HUMAN_REACTION_MS)) {
    reasons.push('reaction_too_fast');
  }

  // 2) Identical timing across many taps -> bot.
  if (correctEvents.length >= IDENTICAL_TIMING_MIN_SAMPLES) {
    const first = correctEvents[0].reactionMs;
    if (correctEvents.every((e) => e.reactionMs === first)) {
      reasons.push('identical_timing');
    }
  }

  // 3) Claimed score above the theoretical maximum.
  if (
    input.claimedScore != null &&
    input.claimedScore > theoreticalMaxScore(session, input.comboBonus ?? 0)
  ) {
    reasons.push('score_exceeds_max');
  }

  // 4) Session wall-clock shorter than the sum of reaction times.
  const duration = (session.endTime || Date.now()) - session.startTime;
  const totalReaction = session.events.reduce((sum, e) => sum + Math.max(0, e.reactionMs), 0);
  if (duration > 0 && duration < totalReaction) {
    reasons.push('duration_too_short');
  }

  // 5) No recorded events but a positive score claimed.
  if ((input.claimedScore ?? 0) > 0 && session.events.length === 0) {
    reasons.push('event_score_mismatch');
  }

  return { valid: reasons.length === 0, reasons };
}
