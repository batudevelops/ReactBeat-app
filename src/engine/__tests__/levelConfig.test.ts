jest.mock('../../services/firebase/remoteConfig', () => ({
  getRemoteConfig: () => ({
    combo_multiplier_step: 0.1,
    combo_threshold: 3,
    reflex_level_31_timeLimit: 900,
    reflex_level_31_options: 4,
    memory_level_31_gridSize: 20,
    memory_level_31_showDuration: 500,
    pattern_level_31_showDuration: 350,
    interstitial_threshold: 3,
    daily_leaderboard_size: 100,
  }),
}));

import { getLevelConfig } from '../levelConfig';

describe('getLevelConfig', () => {
  it('returns easier reflex settings at low levels', () => {
    const cfg = getLevelConfig('reflex', 1);
    expect(cfg.timeLimit).toBe(2000);
    expect(cfg.options).toBe(2);
    expect(cfg.lives).toBe(3);
  });

  it('uses remote config for reflex level 31+', () => {
    const cfg = getLevelConfig('reflex', 31);
    expect(cfg.timeLimit).toBe(900);
    expect(cfg.options).toBe(4);
  });

  it('returns mode-specific fields for memory', () => {
    const cfg = getLevelConfig('memory', 10);
    expect(cfg.gridSize).toBeDefined();
    expect(cfg.showDuration).toBeDefined();
  });
});
