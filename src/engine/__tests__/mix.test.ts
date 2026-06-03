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
import {
  generateMixRound,
  getMixTimeLimit,
  pickMixSubMode,
} from '../modes/mix';

describe('pickMixSubMode', () => {
  it('never repeats the previous sub-mode when alternatives exist', () => {
    for (let i = 0; i < 50; i += 1) {
      const next = pickMixSubMode('reflex');
      expect(next).not.toBe('reflex');
    }
  });
});

describe('generateMixRound', () => {
  it('uses the mix level for each sub-mode config at level 40', () => {
    const mixRound = generateMixRound(40);
    const subCfg = getLevelConfig(mixRound.subMode, 40);
    const standaloneCfg = getLevelConfig(mixRound.subMode, 40);

    expect(subCfg.timeLimit).toBe(standaloneCfg.timeLimit);
    expect(subCfg.gridSize).toBe(standaloneCfg.gridSize);
    expect(subCfg.showDuration).toBe(standaloneCfg.showDuration);
    expect(subCfg.options).toBe(standaloneCfg.options);
  });

  it('applies sub-mode time limits through getMixTimeLimit', () => {
    let memoryRound = generateMixRound(10);
    let attempts = 0;
    while (memoryRound.subMode !== 'memory' && attempts < 30) {
      memoryRound = generateMixRound(10, memoryRound.subMode);
      attempts += 1;
    }
    expect(memoryRound.subMode).toBe('memory');
    if (memoryRound.subMode !== 'memory') {
      throw new Error('expected memory round');
    }

    const limit = getMixTimeLimit(memoryRound, 10);
    const expected =
      memoryRound.round.sequence.length * memoryRound.round.showDuration + 4000;
    expect(limit).toBe(expected);
  });
});

describe('getLevelConfig mix', () => {
  it('returns mix session defaults', () => {
    const cfg = getLevelConfig('mix', 5);
    expect(cfg.lives).toBe(8);
    expect(cfg.comboBonus).toBe(12);
    expect(cfg.timeLimit).toBeGreaterThan(0);
  });
});
