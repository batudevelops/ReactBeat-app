import type { LevelConfig } from '../levelConfig';
import { randomInt } from './util';

export interface MemoryRound {
  gridSize: number; // total cells
  /** Order in which cells light up; the player must repeat it. */
  sequence: number[];
  showDuration: number; // ms per cell reveal
}

export function generateMemoryRound(
  config: LevelConfig,
  level: number,
): MemoryRound {
  const gridSize = config.gridSize ?? 9;
  const showDuration = config.showDuration ?? 700;
  const length = Math.max(3, Math.min(3 + Math.floor(level / 3), gridSize));

  const sequence: number[] = [];
  for (let i = 0; i < length; i += 1) {
    sequence.push(randomInt(gridSize));
  }
  return { gridSize, sequence, showDuration };
}

/** True when the player's taps match the shown sequence exactly. */
export function isMemoryAnswerCorrect(
  round: MemoryRound,
  taps: number[],
): boolean {
  return (
    taps.length === round.sequence.length &&
    taps.every((t, i) => t === round.sequence[i])
  );
}
