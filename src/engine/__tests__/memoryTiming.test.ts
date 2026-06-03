import { getMemoryInputDelayMs } from '../modes/memoryTiming';

describe('memoryTiming', () => {
  it('waits for full sequence playback before input opens', () => {
    const round = {
      gridSize: 9,
      sequence: [0, 3, 6],
      showDuration: 700,
    };
    const cellOnMs = Math.round(700 * 0.7);
    const stepMs = cellOnMs + 400;
    const expected =
      400 + Math.max(0, 3 * stepMs - 400) + 500;

    expect(getMemoryInputDelayMs(round)).toBe(expected);
  });
});
