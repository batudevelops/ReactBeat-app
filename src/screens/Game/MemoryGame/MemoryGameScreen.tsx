import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  generateMemoryRound,
  isMemoryAnswerCorrect,
  type MemoryRound,
} from '../../../engine/modes';
import { getMemoryInputDelayMs } from '../../../engine/modes/memoryTiming';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';
import { useMemorySequence } from '../useMemorySequence';

/** Pause between rounds before the next sequence is shown. */
const INTER_ROUND_DELAY_MS = 900;

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
    getTimerStartDelay: (r) => getMemoryInputDelayMs(r),
    interRoundDelayMs: INTER_ROUND_DELAY_MS,
  });

  const { phase, activeCell, tapCount, canAcceptInput, registerTap } =
    useMemorySequence(round, betweenRounds);

  const onCellPress = (index: number) => {
    registerTap(index, submit);
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
          <View
            style={[styles.grid, { maxWidth: cols * 80 }]}
            pointerEvents={canAcceptInput ? 'auto' : 'none'}
          >
            {Array.from({ length: round.gridSize }, (_, i) => (
              <Pressable
                key={i}
                onPress={() => onCellPress(i)}
                style={[
                  styles.cell,
                  !betweenRounds && activeCell === i
                    ? { backgroundColor: colors.orange500 }
                    : { backgroundColor: colors.bgElevated },
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canAcceptInput }}
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
