import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  generateMemoryRound,
  isMemoryAnswerCorrect,
  type MemoryRound,
} from '../../../engine/modes';
import { colors, radius, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

function columnsFor(gridSize: number): number {
  return Math.ceil(Math.sqrt(gridSize));
}

export function MemoryGameScreen({
  level,
  onFinish,
}: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const { round, msLeft, timeLimit, score, combo, lives, maxLives, submit } =
    useGameController<MemoryRound, number[]>({
      mode: 'memory',
      level,
      generate: (cfg, lvl) => generateMemoryRound(cfg, lvl),
      isCorrect: (r, taps) => isMemoryAnswerCorrect(r, taps),
      onFinish,
      getTimeLimit: (r) => r.sequence.length * r.showDuration + 4000,
    });

  const [phase, setPhase] = useState<'show' | 'input'>('show');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const tapsRef = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (!round) {
      return;
    }
    setPhase('show');
    setActiveCell(null);
    tapsRef.current = [];
    setTapCount(0);

    const timers: ReturnType<typeof setTimeout>[] = [];
    round.sequence.forEach((cell, i) => {
      timers.push(
        setTimeout(() => setActiveCell(cell), i * round.showDuration),
      );
      timers.push(
        setTimeout(
          () => setActiveCell(null),
          i * round.showDuration + round.showDuration * 0.6,
        ),
      );
    });
    timers.push(
      setTimeout(() => setPhase('input'), round.sequence.length * round.showDuration),
    );

    return () => timers.forEach(clearTimeout);
  }, [round]);

  const onCellPress = (index: number) => {
    if (phase !== 'input' || !round) {
      return;
    }
    const taps = [...tapsRef.current, index];
    tapsRef.current = taps;
    setTapCount(taps.length);
    setActiveCell(index);
    setTimeout(() => setActiveCell(null), 150);
    if (taps.length >= round.sequence.length) {
      submit(taps);
    }
  };

  const cols = round ? columnsFor(round.gridSize) : 3;

  return (
    <View style={styles.container}>
      <GameHud
        score={score}
        combo={combo}
        lives={lives}
        maxLives={maxLives}
        msLeft={msLeft}
        timeLimit={timeLimit}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={styles.hint}>
            {phase === 'show'
              ? t('game.memoryWatch')
              : t('game.memoryRepeat', {
                  current: tapCount,
                  total: round.sequence.length,
                })}
          </Text>
          <View style={[styles.grid, { maxWidth: cols * 80 }]}>
            {Array.from({ length: round.gridSize }, (_, i) => (
              <Pressable
                key={i}
                disabled={phase === 'show'}
                onPress={() => onCellPress(i)}
                style={[
                  styles.cell,
                  activeCell === i
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
