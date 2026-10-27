import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { CellGrid, GameHud } from '../../../components/game';
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
          <CellGrid
            count={round.gridSize}
            tileSize={68}
            gap={spacing.sm}
            tileRadius={radius.md}
            maxWidth={cols * 80}
            onCellPress={onCellPress}
            disabled={!canAcceptInput}
            cellColor={(i) =>
              !betweenRounds && activeCell === i
                ? colors.orange500
                : colors.bgElevated
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  hint: { color: colors.textMuted, fontSize: typography.body.fontSize },
});
