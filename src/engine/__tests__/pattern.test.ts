import { generatePatternRound } from '../modes/pattern';

describe('pattern mode', () => {
  const cfg = {
    timeLimit: 3000,
    options: 4,
    lives: 8,
    speedMultiplier: 1,
    comboBonus: 10,
    streakThreshold: 3,
    showDuration: 800,
  };

  it('level 1 uses match transform only', () => {
    for (let i = 0; i < 20; i += 1) {
      const round = generatePatternRound(cfg, 1);
      expect(round.transform).toBe('match');
      const correct = round.options.find((o) => o.id === round.correctId)!;
      expect(correct.cells).toEqual(round.target);
    }
  });

  it('level 8 always asks for 90 clockwise rotation', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(generatePatternRound(cfg, 8).transform).toBe('cw90');
    }
  });

  it('rotation rounds use sibling rotations as distractors', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = generatePatternRound(cfg, 18);
      if (round.transform !== 'cw180') {
        continue;
      }
      expect(round.options).toHaveLength(4);
      const correct = round.options.find((o) => o.id === round.correctId)!;
      expect(correct.cells.join(',')).not.toBe(round.target.join(','));
      return;
    }
    throw new Error('expected at least one cw180 round');
  });

  it('high levels can emit counter-clockwise prompts', () => {
    const transforms = new Set<string>();
    for (let i = 0; i < 60; i += 1) {
      transforms.add(generatePatternRound(cfg, 25).transform);
    }
    expect(transforms.has('ccw90')).toBe(true);
  });
});
