jest.mock('expo-constants', () => ({
  default: { deviceName: 'jest-device' },
}));
jest.mock('expo-crypto', () => ({
  randomUUID: () => '00000000-0000-4000-8000-000000000001',
}));
jest.mock('../scorer', () => ({
  calculateScore: jest.fn(() => 100),
}));

import {
  MIN_HUMAN_REACTION_MS,
  createSession,
  theoreticalMaxScore,
  validateSession,
} from '../antiCheat';
import type { TapEvent } from '../../types/session';

function tap(partial: Partial<TapEvent>): TapEvent {
  return {
    ts: Date.now(),
    questionId: 'q1',
    answer: 'a',
    correct: true,
    reactionMs: 200,
    ...partial,
  };
}

describe('validateSession', () => {
  it('rejects impossibly fast reactions', () => {
    let session = createSession('reflex', 1);
    session = {
      ...session,
      events: [tap({ reactionMs: MIN_HUMAN_REACTION_MS - 1 })],
    };
    const result = validateSession(session, { claimedScore: 100, comboBonus: 10 });
    expect(result.valid).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('accepts a normal session within theoretical max', () => {
    let session = createSession('reflex', 1);
    session = {
      ...session,
      endTime: session.startTime + 10_000,
      events: [tap({ reactionMs: 250 }), tap({ reactionMs: 300 })],
    };
    const max = theoreticalMaxScore(session, 10);
    const result = validateSession(session, { claimedScore: max, comboBonus: 10 });
    expect(result.valid).toBe(true);
  });
});
