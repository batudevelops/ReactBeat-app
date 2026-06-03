import type { MemoryRound } from './memory';

export const MEMORY_SEQUENCE_CELL_GAP_MS = 400;
export const MEMORY_PRE_INPUT_PAUSE_MS = 500;
export const MEMORY_PRE_SEQUENCE_PAUSE_MS = 400;

/** Ms from round start until the player may tap (after full sequence + pause). */
export function getMemoryInputDelayMs(round: MemoryRound): number {
  const cellOnMs = Math.round(round.showDuration * 0.7);
  const stepMs = cellOnMs + MEMORY_SEQUENCE_CELL_GAP_MS;
  return (
    MEMORY_PRE_SEQUENCE_PAUSE_MS +
    Math.max(0, round.sequence.length * stepMs - MEMORY_SEQUENCE_CELL_GAP_MS) +
    MEMORY_PRE_INPUT_PAUSE_MS
  );
}
