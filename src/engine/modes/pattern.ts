import type { LevelConfig } from '../levelConfig';
import { nextId, randomInt, shuffle } from './util';

export interface PatternOption {
  id: string;
  /** Filled-cell indices within the grid. */
  cells: number[];
}

export interface PatternRound {
  gridSize: number; // total cells (e.g. 9 for 3x3)
  target: number[]; // the pattern shown briefly
  options: PatternOption[];
  correctId: string;
  showDuration: number;
}

const GRID = 9; // 3x3

function randomPattern(filled: number): number[] {
  const indices = shuffle(Array.from({ length: GRID }, (_, i) => i));
  return indices.slice(0, filled).sort((a, b) => a - b);
}

function sameCells(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function generatePatternRound(config: LevelConfig): PatternRound {
  const filled = Math.min(3 + randomInt(2), GRID); // 3-4 filled cells
  const target = randomPattern(filled);

  const options: PatternOption[] = [{ id: nextId('pat'), cells: target }];
  let guard = 0;
  while (options.length < 4 && guard < 50) {
    guard += 1;
    const candidate = randomPattern(filled);
    if (!options.some((o) => sameCells(o.cells, candidate))) {
      options.push({ id: nextId('pat'), cells: candidate });
    }
  }

  const correctId = options[0].id;
  return {
    gridSize: GRID,
    target,
    options: shuffle(options),
    correctId,
    showDuration: config.showDuration ?? 800,
  };
}
