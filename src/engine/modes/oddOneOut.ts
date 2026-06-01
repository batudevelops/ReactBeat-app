import type { LevelConfig } from '../levelConfig';
import { GAME_COLORS, nextId, pick, randomInt } from './util';

export interface OddItem {
  id: string;
  hex: string;
}

export interface OddOneOutRound {
  gridSize: number; // total cells
  items: OddItem[]; // all share baseHex except one (oddId)
  oddId: string;
}

/** Slightly shifts a hex color so the odd one is subtly different at high levels. */
function shiftHex(hex: string, level: number): string {
  const amount = Math.max(8, 60 - level * 2); // harder = smaller diff
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function generateOddOneOutRound(
  config: LevelConfig,
  level: number,
): OddOneOutRound {
  const gridSize = config.gridSize ?? 4;
  const base = pick(GAME_COLORS);
  const oddHex = shiftHex(base.hex, level);
  const oddIndex = randomInt(gridSize);

  const items: OddItem[] = Array.from({ length: gridSize }, (_, i) => ({
    id: nextId('odd'),
    hex: i === oddIndex ? oddHex : base.hex,
  }));

  return { gridSize, items, oddId: items[oddIndex].id };
}
