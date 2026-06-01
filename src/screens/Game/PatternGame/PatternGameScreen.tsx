import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import { generatePatternRound, type PatternRound } from '../../../engine/modes';
import { colors, radius, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

const GRID = 9;
const COLS = 3;

function PatternGrid({
  cells,
  tile,
  active,
}: Readonly<{ cells: number[]; tile: number; active: boolean }>) {
  return (
    <View style={[styles.grid, { width: COLS * (tile + 4) }]}>
      {Array.from({ length: GRID }, (_, i) => (
        <View
          key={i}
          style={[
            styles.gridCell,
            { width: tile, height: tile },
            cells.includes(i)
              ? { backgroundColor: active ? colors.orange500 : colors.special }
              : { backgroundColor: colors.bgElevated },
          ]}
        />
      ))}
    </View>
  );
}

export function PatternGameScreen({
  level,
  onFinish,
}: Readonly<GameModeScreenProps>) {
  const { round, msLeft, timeLimit, score, combo, lives, submit } =
    useGameController<PatternRound, string>({
      mode: 'pattern',
      level,
      generate: (cfg) => generatePatternRound(cfg),
      isCorrect: (r, id) => id === r.correctId,
      onFinish,
      getTimeLimit: (r, cfg) => cfg.timeLimit + r.showDuration,
    });

  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (!round) {
      return;
    }
    setRevealed(true);
    const t = setTimeout(() => setRevealed(false), round.showDuration);
    return () => clearTimeout(t);
  }, [round]);

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
          {revealed ? (
            <>
              <Text style={styles.hint}>Deseni ezberle</Text>
              <PatternGrid cells={round.target} tile={56} active />
            </>
          ) : (
            <>
              <Text style={styles.hint}>Hangisiydi?</Text>
              <View style={styles.options}>
                {round.options.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => submit(opt.id)}
                    style={styles.optionCard}
                    accessibilityRole="button"
                  >
                    <PatternGrid cells={opt.cells} tile={28} active={false} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  hint: { color: colors.textMuted, fontSize: typography.body.fontSize },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  gridCell: { borderRadius: radius.sm },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  optionCard: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    backgroundColor: colors.bgSurface,
  },
});
