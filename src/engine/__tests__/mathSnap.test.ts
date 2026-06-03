import { generateMathSnapRound } from '../modes/mathSnap';

describe('mathSnap mode', () => {
  const cfg = {
    timeLimit: 2000,
    options: 4,
    lives: 8,
    speedMultiplier: 1,
    comboBonus: 13,
    streakThreshold: 3,
  };

  it('level 1 only generates addition', () => {
    for (let i = 0; i < 20; i += 1) {
      const round = generateMathSnapRound(cfg, 1);
      expect(round.kind).toBe('add');
      expect(round.prompt).toMatch(/^\d+ \+ \d+$/);
      const answer = Number(
        round.options.find((o) => o.id === round.correctId)!.label,
      );
      const [a, b] = round.prompt.split(' + ').map(Number);
      expect(answer).toBe(a + b);
    }
  });

  it('resolves missing-number prompts', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = generateMathSnapRound(cfg, 12);
      if (round.kind !== 'missingRight') {
        continue;
      }
      const answer = Number(
        round.options.find((o) => o.id === round.correctId)!.label,
      );
      const match = /^(\d+) \+ \? = (\d+)$/.exec(round.prompt);
      expect(match).not.toBeNull();
      const a = Number(match![1]);
      const sum = Number(match![2]);
      expect(a + answer).toBe(sum);
      return;
    }
    throw new Error('expected at least one missingRight round');
  });

  it('compare rounds use the larger value as correct', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = generateMathSnapRound(cfg, 18);
      if (round.kind !== 'compare') {
        continue;
      }
      const [a, b] = round.prompt.split('  ·  ').map(Number);
      const answer = Number(
        round.options.find((o) => o.id === round.correctId)!.label,
      );
      expect(answer).toBe(Math.max(a, b));
      return;
    }
    throw new Error('expected at least one compare round');
  });

  it('oddEven rounds only offer odd and even labels', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = generateMathSnapRound(cfg, 25);
      if (round.kind !== 'oddEven') {
        continue;
      }
      const n = Number(round.prompt);
      const labels = round.options.map((o) => o.label).sort();
      expect(labels).toEqual(['even', 'odd']);
      const correct = round.options.find((o) => o.id === round.correctId)!;
      expect(correct.label).toBe(n % 2 === 1 ? 'odd' : 'even');
      return;
    }
    throw new Error('expected at least one oddEven round');
  });

  it('high levels can emit advanced puzzle kinds', () => {
    const kinds = new Set<string>();
    for (let i = 0; i < 80; i += 1) {
      kinds.add(generateMathSnapRound(cfg, 30).kind);
    }
    expect(kinds.has('chainAdd') || kinds.has('half')).toBe(true);
  });
});
