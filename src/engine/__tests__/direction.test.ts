import {
  generateDirectionRound,
  isDirectionAnswerCorrect,
} from '../modes/direction';

describe('direction mode', () => {
  const cfg = {
    timeLimit: 2000,
    options: 4,
    lives: 8,
    speedMultiplier: 1,
    comboBonus: 13,
    streakThreshold: 3,
  };

  it('level 1 uses direct word prompts only', () => {
    for (let i = 0; i < 20; i += 1) {
      const round = generateDirectionRound(cfg, 1);
      expect(round.kind).toBe('directWord');
      expect(round.correctDirection).toBe(round.reference);
    }
  });

  it('resolves opposite prompts', () => {
    for (let i = 0; i < 40; i += 1) {
      const round = generateDirectionRound(cfg, 15);
      if (round.kind !== 'opposite') {
        continue;
      }
      const expected =
        round.reference === 'up'
          ? 'down'
          : round.reference === 'down'
            ? 'up'
            : round.reference === 'left'
              ? 'right'
              : 'left';
      expect(round.correctDirection).toBe(expected);
      expect(isDirectionAnswerCorrect(round, expected)).toBe(true);
      expect(isDirectionAnswerCorrect(round, round.reference)).toBe(false);
      return;
    }
    throw new Error('expected at least one opposite round');
  });

  it('resolves clockwise turns', () => {
    expect(
      isDirectionAnswerCorrect(
        {
          kind: 'clockwise',
          reference: 'up',
          correctDirection: 'right',
        },
        'right',
      ),
    ).toBe(true);
  });

  it('high levels can emit advanced prompt kinds', () => {
    const kinds = new Set<string>();
    for (let i = 0; i < 60; i += 1) {
      kinds.add(generateDirectionRound(cfg, 30).kind);
    }
    expect(kinds.has('mirrorHorizontal') || kinds.has('mirrorVertical')).toBe(
      true,
    );
  });
});
