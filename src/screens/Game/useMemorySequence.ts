import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { MemoryRound } from '../../engine/modes';
import {
  getMemoryInputDelayMs,
  MEMORY_PRE_SEQUENCE_PAUSE_MS,
  MEMORY_SEQUENCE_CELL_GAP_MS,
} from '../../engine/modes/memoryTiming';

export function useMemorySequence(
  round: MemoryRound | null,
  betweenRounds: boolean,
) {
  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const tapsRef = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const inputReadyRef = useRef(false);

  useLayoutEffect(() => {
    inputReadyRef.current = false;
    setActiveCell(null);
    if (betweenRounds || !round) {
      return;
    }
    setPhase('show');
    tapsRef.current = [];
    setTapCount(0);
  }, [round, betweenRounds]);

  useEffect(() => {
    if (!round || betweenRounds) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const cellOnMs = Math.round(round.showDuration * 0.7);
    const stepMs = cellOnMs + MEMORY_SEQUENCE_CELL_GAP_MS;
    const showEnd = getMemoryInputDelayMs(round);

    round.sequence.forEach((cell, i) => {
      const startAt = MEMORY_PRE_SEQUENCE_PAUSE_MS + i * stepMs;
      timers.push(setTimeout(() => setActiveCell(cell), startAt));
      timers.push(setTimeout(() => setActiveCell(null), startAt + cellOnMs));
    });

    timers.push(
      setTimeout(() => {
        inputReadyRef.current = true;
        setPhase('input');
      }, showEnd),
    );

    return () => {
      inputReadyRef.current = false;
      timers.forEach(clearTimeout);
    };
  }, [round, betweenRounds]);

  const canAcceptInput =
    !betweenRounds && round !== null && phase === 'input' && inputReadyRef.current;

  const registerTap = useCallback(
    (index: number, onComplete: (taps: number[]) => void) => {
      if (!inputReadyRef.current || phase !== 'input' || betweenRounds || !round) {
        return;
      }
      const taps = [...tapsRef.current, index];
      tapsRef.current = taps;
      setTapCount(taps.length);
      setActiveCell(index);
      setTimeout(() => setActiveCell(null), 180);
      if (taps.length >= round.sequence.length) {
        onComplete(taps);
      }
    },
    [phase, betweenRounds, round],
  );

  return {
    phase,
    activeCell,
    tapCount,
    canAcceptInput,
    registerTap,
  };
}
