jest.mock('../../services/firebase/remoteConfig', () => ({
  getRemoteConfig: () => ({
    combo_multiplier_step: 0.1,
    combo_threshold: 3,
    reflex_level_31_timeLimit: 1000,
    reflex_level_31_options: 4,
    memory_level_31_gridSize: 16,
    memory_level_31_showDuration: 600,
    pattern_level_31_showDuration: 400,
    interstitial_threshold: 3,
    daily_leaderboard_size: 100,
  }),
}));

import { calculateScore } from '../scorer';

/** Mirrors functions/src/scorer.ts scoreFromSession for regression tests. */
function scoreFromSession(
  events: Array<{
    correct: boolean;
    reactionMs: number;
    timeLimitMs?: number;
    comboBonus?: number;
  }>,
  defaultComboBonus: number,
): number {
  let combo = 0;
  let total = 0;
  for (const event of events) {
    if (!event.correct) {
      combo = 0;
      continue;
    }
    const timeLimit = event.timeLimitMs ?? 2000;
    const comboBonus = event.comboBonus ?? defaultComboBonus;
    total += calculateScore({
      correct: true,
      reactionMs: event.reactionMs,
      timeLimit,
      combo,
      comboBonus,
    });
    combo += 1;
  }
  return total;
}

describe('client/server score replay', () => {
  it('matches when events store the question time limit', () => {
    const timeLimitMs = 2000;
    const comboBonus = 10;
    const events = [
      { correct: true, reactionMs: 800, timeLimitMs, comboBonus },
      { correct: true, reactionMs: 1200, timeLimitMs, comboBonus },
      { correct: false, reactionMs: 0 },
      { correct: true, reactionMs: 400, timeLimitMs, comboBonus },
    ];

    let combo = 0;
    let clientTotal = 0;
    for (const event of events) {
      if (!event.correct) {
        combo = 0;
        continue;
      }
      clientTotal += calculateScore({
        correct: true,
        reactionMs: event.reactionMs,
        timeLimit: timeLimitMs,
        combo,
        comboBonus,
      });
      combo += 1;
    }

    expect(scoreFromSession(events, comboBonus)).toBe(clientTotal);
  });

  it('would mismatch if time limit were omitted (old server bug)', () => {
    const comboBonus = 10;
    const events = [{ correct: true, reactionMs: 800, comboBonus }];
    const client = calculateScore({
      correct: true,
      reactionMs: 800,
      timeLimit: 2000,
      combo: 0,
      comboBonus,
    });
    const legacyServer = calculateScore({
      correct: true,
      reactionMs: 800,
      timeLimit: 800,
      combo: 0,
      comboBonus,
    });
    expect(legacyServer).not.toBe(client);
    expect(
      scoreFromSession([{ ...events[0], timeLimitMs: 2000 }], comboBonus),
    ).toBe(client);
  });

  it('matches across a multi-tap combo chain', () => {
    const timeLimitMs = 2500;
    const comboBonus = 12;
    const events = [
      { correct: true, reactionMs: 600, timeLimitMs, comboBonus },
      { correct: true, reactionMs: 900, timeLimitMs, comboBonus },
      { correct: true, reactionMs: 400, timeLimitMs, comboBonus },
    ];

    let combo = 0;
    let clientTotal = 0;
    for (const event of events) {
      clientTotal += calculateScore({
        correct: true,
        reactionMs: event.reactionMs,
        timeLimit: timeLimitMs,
        combo,
        comboBonus,
      });
      combo += 1;
    }

    expect(scoreFromSession(events, comboBonus)).toBe(clientTotal);
  });
});
