import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import {
  generateColorConflictRound,
  type ColorConflictRound,
} from '../../../engine/modes';
import { colors, radius, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

export function ColorConflictScreen({
  level,
  onFinish,
}: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const { round, msLeft, timeLimit, score, combo, lives, submit } =
    useGameController<ColorConflictRound, string>({
      mode: 'colorConflict',
      level,
      generate: (cfg) => generateColorConflictRound(cfg),
      isCorrect: (r, id) => id === r.correctId,
      onFinish,
    });

  return (
    <View style={styles.container}>
      <GameHud
        score={score}
        combo={combo}
        lives={lives}
        msLeft={msLeft}
        timeLimit={timeLimit}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={styles.hint}>{t('game.colorConflictHint')}</Text>
          <View style={[styles.stage, { backgroundColor: round.backgroundHex }]}>
            <View style={[styles.shape, { backgroundColor: round.shapeColorHex }]} />
          </View>

          <View style={styles.options}>
            {round.options.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.tile, { backgroundColor: opt.hex }]}
                onPress={() => submit(opt.id)}
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
  stage: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shape: { width: 110, height: 110, borderRadius: radius.md },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tile: { width: 64, height: 64, borderRadius: radius.lg },
});
