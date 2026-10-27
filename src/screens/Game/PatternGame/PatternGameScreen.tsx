import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CellGrid, GameHud } from '../../../components/game';
import { generatePatternRound, type PatternRound } from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

const GRID = 9;
const COLS = 3;
const INTER_ROUND_DELAY_MS = 700;

function PatternGrid({
  cells,
  tile,
  active,
}: Readonly<{ cells: number[]; tile: number; active: boolean }>) {
  const filled = new Set(cells);
  return (
    <CellGrid
      count={GRID}
      tileSize={tile}
      gap={4}
      tileRadius={radius.sm}
      width={COLS * (tile + 4)}
      cellColor={(i) =>
        filled.has(i)
          ? active
            ? colors.orange500
            : colors.special
          : colors.bgElevated
      }
    />
  );
}

export function PatternGameScreen({
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
  } = useGameController<PatternRound, string>({
      mode: 'pattern',
      level,
      generate: (cfg, lvl) => generatePatternRound(cfg, lvl),
      isCorrect: (r, id) => id === r.correctId,
      onFinish,
      getTimeLimit: (r, cfg) => cfg.timeLimit + r.showDuration,
      interRoundDelayMs: INTER_ROUND_DELAY_MS,
    });

  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (!round || betweenRounds) {
      return;
    }
    setRevealed(true);
    const timer = setTimeout(() => setRevealed(false), round.showDuration);
    return () => clearTimeout(timer);
  }, [round, betweenRounds]);

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
        levelRules={formatLevelRules('pattern', currentLevel, t)}
        accentColor={MODE_ACCENT.pattern}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          {betweenRounds ? (
            <Text style={styles.hint}>{t('game.patternBetween')}</Text>
          ) : revealed ? (
            <>
              <Text style={styles.hint}>
                {round.transform === 'match'
                  ? t('game.patternMemorize')
                  : t('game.patternMemorizeTransform', {
                      transform: t(`game.patternTransform.${round.transform}`),
                    })}
              </Text>
              <PatternGrid cells={round.target} tile={56} active />
            </>
          ) : (
            <>
              {round.transform === 'match' ? (
                <Text style={styles.hint}>{t('game.patternWhich')}</Text>
              ) : (
                <>
                  <Text style={styles.hint}>{t('game.patternPickTransform')}</Text>
                  <Text style={styles.transformBadge}>
                    {t(`game.patternTransform.${round.transform}`)}
                  </Text>
                </>
              )}
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
  transformBadge: {
    color: colors.textPrimary,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
    letterSpacing: 2,
  },
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
