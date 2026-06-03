import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  formatMathSnapOptionLabel,
  generateMathSnapRound,
  type MathSnapRound,
} from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

export function MathSnapScreen({ level, onFinish }: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const { round, msLeft, timeLimit, score, combo, lives, maxLives, currentLevel, levelUpToken, submit } =
    useGameController<MathSnapRound, string>({
      mode: 'mathSnap',
      level,
      generate: (cfg, lvl) => generateMathSnapRound(cfg, lvl),
      isCorrect: (r, id) => id === r.correctId,
      onFinish,
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
        levelRules={formatLevelRules('mathSnap', currentLevel, t)}
        accentColor={MODE_ACCENT.mathSnap}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={styles.promptLabel}>
            {t(`game.mathSnapHints.${round.kind}`)}
          </Text>
          <Text style={styles.prompt}>{round.prompt}</Text>

          <View style={styles.options}>
            {round.options.map((opt) => {
              const label = formatMathSnapOptionLabel(opt, round.kind, t);
              return (
                <Pressable
                  key={opt.id}
                  style={styles.answerBtn}
                  onPress={() => submit(opt.id)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                >
                  <Text style={styles.answerText}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  promptLabel: { color: colors.textMuted, fontSize: typography.body.fontSize },
  prompt: {
    color: colors.textPrimary,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  answerBtn: {
    minWidth: 88,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    alignItems: 'center',
  },
  answerText: {
    color: colors.textPrimary,
    fontSize: typography.heading3.fontSize,
    fontWeight: '800',
  },
});
