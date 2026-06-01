import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import { generateReflexRound, type ReflexRound } from '../../../engine/modes';
import { colors, radius, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

export function ReflexGameScreen({ level, onFinish }: Readonly<GameModeScreenProps>) {
  const { round, msLeft, timeLimit, score, combo, lives, submit } =
    useGameController<ReflexRound, string>({
      mode: 'reflex',
      level,
      generate: (cfg) => generateReflexRound(cfg),
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
          <Text style={styles.promptLabel}>Bu renge tap’la</Text>
          <Text style={styles.prompt}>{round.prompt}</Text>

          <View style={styles.options}>
            {round.options.map((opt) => (
              <Pressable
                key={opt.id}
                style={[styles.tile, { backgroundColor: opt.hex }]}
                onPress={() => submit(opt.id)}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
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
  tile: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
  },
});
