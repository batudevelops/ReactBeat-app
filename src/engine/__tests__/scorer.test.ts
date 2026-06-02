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

import { calculateScore, calculateXP } from '../scorer';

describe('calculateScore', () => {
  it('returns 0 for wrong answers', () => {
    expect(
      calculateScore({
        correct: false,
        reactionMs: 100,
        timeLimit: 2000,
        combo: 5,
        comboBonus: 10,
      }),
    ).toBe(0);
  });

  it('adds speed bonus for fast reactions', () => {
    const fast = calculateScore({
      correct: true,
      reactionMs: 0,
      timeLimit: 2000,
      combo: 0,
      comboBonus: 10,
    });
    const slow = calculateScore({
      correct: true,
      reactionMs: 2000,
      timeLimit: 2000,
      combo: 0,
      comboBonus: 10,
    });
    expect(fast).toBeGreaterThan(slow);
  });

  it('scales with combo multiplier and flat bonus', () => {
    const base = calculateScore({
      correct: true,
      reactionMs: 1000,
      timeLimit: 2000,
      combo: 0,
      comboBonus: 10,
    });
    const combo = calculateScore({
      correct: true,
      reactionMs: 1000,
      timeLimit: 2000,
      combo: 3,
      comboBonus: 10,
    });
    expect(combo).toBeGreaterThan(base);
  });
});

describe('calculateXP', () => {
  it('returns 1 XP per 10 points', () => {
    expect(calculateXP(0)).toBe(0);
    expect(calculateXP(99)).toBe(9);
    expect(calculateXP(100)).toBe(10);
  });
});
