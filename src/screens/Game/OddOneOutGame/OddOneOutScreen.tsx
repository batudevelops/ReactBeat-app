import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  generateOddOneOutRound,
  type OddOneOutRound,
} from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

function columnsFor(gridSize: number): number {
  return Math.ceil(Math.sqrt(gridSize));
}

export function OddOneOutScreen({
  level,
  onFinish,
}: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const { round, msLeft, timeLimit, score, combo, lives, maxLives, currentLevel, levelUpToken, submit } =
    useGameController<OddOneOutRound, string>({
      mode: 'oddOneOut',
      level,
      generate: (cfg, lvl) => generateOddOneOutRound(cfg, lvl),
      isCorrect: (r, id) => id === r.oddId,
      onFinish,
    });

  const cols = round ? columnsFor(round.gridSize) : 2;

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
        levelRules={formatLevelRules('oddOneOut', currentLevel, t)}
        accentColor={MODE_ACCENT.oddOneOut}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={styles.hint}>{t('game.oddOneOutHint')}</Text>
          <View style={[styles.grid, { maxWidth: cols * 84 }]}>
            {round.items.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.cell, { backgroundColor: item.hex }]}
                onPress={() => submit(item.id)}
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
  cell: { width: 72, height: 72, borderRadius: radius.md },
});
