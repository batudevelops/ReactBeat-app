import type { LevelConfig } from '../levelConfig';
import { nextId, pick, randomInt, shuffle } from './util';

export type PatternTransform = 'match' | 'cw90' | 'cw180' | 'ccw90';

export interface PatternOption {
  id: string;
  /** Filled-cell indices within the grid. */
  cells: number[];
}

export interface PatternRound {
  gridSize: number;
  target: number[];
  transform: PatternTransform;
  options: PatternOption[];
  correctId: string;
  showDuration: number;
}

const GRID = 9;
const COLS = 3;

function randomPattern(filled: number): number[] {
  const indices = shuffle(Array.from({ length: GRID }, (_, i) => i));
  return indices.slice(0, filled).sort((a, b) => a - b);
}

function sameCells(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function rotateCells(cells: number[], transform: PatternTransform): number[] {
  if (transform === 'match') {
    return [...cells].sort((a, b) => a - b);
  }

  const steps = transform === 'cw90' ? 1 : transform === 'cw180' ? 2 : 3;

  return cells
    .map((index) => {
      let r = Math.floor(index / COLS);
      let c = index % COLS;
      for (let i = 0; i < steps; i += 1) {
        const nr = c;
        const nc = COLS - 1 - r;
        r = nr;
        c = nc;
      }
      return r * COLS + c;
    })
    .sort((a, b) => a - b);
}

function hasDistinctRotations(cells: number[]): boolean {
  const variants = (
    ['match', 'cw90', 'cw180', 'ccw90'] as PatternTransform[]
  ).map((transform) => rotateCells(cells, transform));
  return new Set(variants.map((v) => v.join(','))).size === 4;
}

function randomAsymmetricPattern(filled: number): number[] {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const pattern = randomPattern(filled);
    if (hasDistinctRotations(pattern)) {
      return pattern;
    }
  }
  return [0, 1, 3, 6];
}

function pickTransform(level: number): PatternTransform {
  if (level <= 5) {
    return 'match';
  }
  if (level <= 10) {
    return 'cw90';
  }
  if (level <= 15) {
    return pick(['cw90', 'ccw90'] as const);
  }
  if (level <= 20) {
    return pick(['cw90', 'ccw90', 'cw180'] as const);
  }
  return pick(['cw90', 'ccw90', 'cw180'] as const);
}

function buildMatchOptions(target: number[], filled: number): PatternOption[] {
  const options: PatternOption[] = [{ id: nextId('pat'), cells: target }];
  let guard = 0;
  while (options.length < 4 && guard < 50) {
    guard += 1;
    const candidate = randomPattern(filled);
    if (!options.some((o) => sameCells(o.cells, candidate))) {
      options.push({ id: nextId('pat'), cells: candidate });
    }
  }
  return options;
}

function buildRotationOptions(
  target: number[],
  transform: PatternTransform,
): PatternOption[] {
  const correctCells = rotateCells(target, transform);
  const pool = (['match', 'cw90', 'cw180', 'ccw90'] as PatternTransform[])
    .filter((t) => t !== transform)
    .map((t) => rotateCells(target, t));

  const options: PatternOption[] = [
    { id: nextId('pat'), cells: correctCells },
  ];

  for (const cells of pool) {
    if (options.some((o) => sameCells(o.cells, cells))) {
      continue;
    }
    options.push({ id: nextId('pat'), cells });
  }

  return options;
}

export function generatePatternRound(
  config: LevelConfig,
  level: number,
): PatternRound {
  const transform = pickTransform(level);
  const filled = Math.min(3 + randomInt(2), GRID);
  const target =
    transform === 'match'
      ? randomPattern(filled)
      : randomAsymmetricPattern(filled);

  const options =
    transform === 'match'
      ? buildMatchOptions(target, filled)
      : buildRotationOptions(target, transform);

  const correctCells = rotateCells(target, transform);
  const correct = options.find((o) => sameCells(o.cells, correctCells))!;

  return {
    gridSize: GRID,
    target,
    transform,
    options: shuffle(options),
    correctId: correct.id,
    showDuration: config.showDuration ?? 800,
  };
}
