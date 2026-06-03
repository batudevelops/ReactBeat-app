import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  generateMemoryRound,
  isMemoryAnswerCorrect,
  type MemoryRound,
} from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

/** Pause between rounds before the next sequence is shown. */
const INTER_ROUND_DELAY_MS = 900;
/** Gap between each cell highlight within a sequence. */
const SEQUENCE_CELL_GAP_MS = 400;
/** Extra pause after the full sequence before input opens. */
const PRE_INPUT_PAUSE_MS = 500;
/** Blank grid before the sequence starts (avoids stale cell flash). */
const PRE_SEQUENCE_PAUSE_MS = 400;

function columnsFor(gridSize: number): number {
  return Math.ceil(Math.sqrt(gridSize));
}

export function MemoryGameScreen({
  level,
  onFinish,
}: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const {
    round,
    msLeft,
    timeLimit,
    score,
    combo,
    lives,
    maxLives,
    betweenRounds,
    currentLevel,
    levelUpToken,
    submit,
  } = useGameController<MemoryRound, number[]>({
    mode: 'memory',
    level,
    generate: (cfg, lvl) => generateMemoryRound(cfg, lvl),
    isCorrect: (r, taps) => isMemoryAnswerCorrect(r, taps),
    onFinish,
    getTimeLimit: (r) => r.sequence.length * r.showDuration + 4000,
    interRoundDelayMs: INTER_ROUND_DELAY_MS,
  });

  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const tapsRef = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState(0);

  useLayoutEffect(() => {
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
    const stepMs = cellOnMs + SEQUENCE_CELL_GAP_MS;

    round.sequence.forEach((cell, i) => {
      const startAt = PRE_SEQUENCE_PAUSE_MS + i * stepMs;
      timers.push(
        setTimeout(() => setActiveCell(cell), startAt),
      );
      timers.push(
        setTimeout(() => setActiveCell(null), startAt + cellOnMs),
      );
    });

    const showEnd =
      PRE_SEQUENCE_PAUSE_MS +
      Math.max(0, round.sequence.length * stepMs - SEQUENCE_CELL_GAP_MS) +
      PRE_INPUT_PAUSE_MS;
    timers.push(setTimeout(() => setPhase('input'), showEnd));

    return () => timers.forEach(clearTimeout);
  }, [round, betweenRounds]);

  const onCellPress = (index: number) => {
    if (phase !== 'input' || betweenRounds || !round) {
      return;
    }
    const taps = [...tapsRef.current, index];
    tapsRef.current = taps;
    setTapCount(taps.length);
    setActiveCell(index);
    setTimeout(() => setActiveCell(null), 180);
    if (taps.length >= round.sequence.length) {
      submit(taps);
    }
  };

  const cols = round ? columnsFor(round.gridSize) : 3;

  const hint = betweenRounds
    ? t('game.memoryBetween')
    : phase === 'show'
      ? t('game.memoryWatch')
      : t('game.memoryRepeat', {
          current: tapCount,
          total: round?.sequence.length ?? 0,
        });

  return (
    <View style={styles.container}>
      <GameHud
        score={score}
        combo={combo}
        lives={lives}
        maxLives={maxLives}
        msLeft={msLeft}
        timeLimit={timeLimit}
        level={currentLevel}
        levelRules={formatLevelRules('memory', currentLevel, t)}
        accentColor={MODE_ACCENT.memory}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={styles.hint}>{hint}</Text>
          <View style={[styles.grid, { maxWidth: cols * 80 }]}>
            {Array.from({ length: round.gridSize }, (_, i) => (
              <Pressable
                key={i}
                disabled={phase !== 'input' || betweenRounds}
                onPress={() => onCellPress(i)}
                style={[
                  styles.cell,
                  !betweenRounds && activeCell === i
                    ? { backgroundColor: colors.orange500 }
                    : { backgroundColor: colors.bgElevated },
                ]}
                accessibilityRole="button"
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  hint: { color: colors.textMuted, fontSize: typography.body.fontSize },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cell: { width: 68, height: 68, borderRadius: radius.md },
});
