import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameHud } from '../../../components/game';
import { DirectionPromptPad } from '../../../components/game/DirectionPromptPad';
import {
  formatMathSnapOptionLabel,
  generateMixRound,
  isMixAnswerCorrect,
  type MixAnswer,
  type MixRound,
} from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { colors, radius, spacing, typography } from '../../../theme';
import { MODE_ACCENT, type MixSubMode } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

const MEMORY_INTER_ROUND_MS = 900;
const PATTERN_INTER_ROUND_MS = 700;
const DEFAULT_INTER_ROUND_MS = 400;
const SEQUENCE_CELL_GAP_MS = 400;
const PRE_INPUT_PAUSE_MS = 500;
const PRE_SEQUENCE_PAUSE_MS = 400;
const PATTERN_GRID = 9;
const PATTERN_COLS = 3;

function columnsFor(gridSize: number): number {
  return Math.ceil(Math.sqrt(gridSize));
}

function PatternGrid({
  cells,
  tile,
  active,
}: Readonly<{ cells: number[]; tile: number; active: boolean }>) {
  return (
    <View style={[styles.patternGrid, { width: PATTERN_COLS * (tile + 4) }]}>
      {Array.from({ length: PATTERN_GRID }, (_, i) => (
        <View
          key={i}
          style={[
            styles.patternCell,
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

export function MixGameScreen({ level, onFinish }: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const lastSubMode = useRef<MixSubMode | undefined>(undefined);

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
  } = useGameController<MixRound, MixAnswer>({
    mode: 'mix',
    level,
    generate: (_cfg, lvl) => {
      const next = generateMixRound(lvl, lastSubMode.current);
      lastSubMode.current = next.subMode;
      return next;
    },
    isCorrect: isMixAnswerCorrect,
    onFinish,
    getConfigMode: (r) => r.subMode,
    getTimeLimit: (r, cfg) => {
      if (r.subMode === 'memory') {
        return r.round.sequence.length * r.round.showDuration + 4000;
      }
      if (r.subMode === 'pattern') {
        return cfg.timeLimit + r.round.showDuration;
      }
      return cfg.timeLimit;
    },
    getInterRoundDelay: (r) => {
      switch (r.subMode) {
        case 'memory':
          return MEMORY_INTER_ROUND_MS;
        case 'pattern':
          return PATTERN_INTER_ROUND_MS;
        default:
          return DEFAULT_INTER_ROUND_MS;
      }
    },
  });

  const [memoryPhase, setMemoryPhase] = useState<'show' | 'input'>('show');
  const [memoryActiveCell, setMemoryActiveCell] = useState<number | null>(null);
  const memoryTapsRef = useRef<number[]>([]);
  const [memoryTapCount, setMemoryTapCount] = useState(0);
  const [patternRevealed, setPatternRevealed] = useState(true);

  const memoryRound =
    round?.subMode === 'memory' && !betweenRounds ? round.round : null;

  useLayoutEffect(() => {
    setMemoryActiveCell(null);
    if (!memoryRound) {
      return;
    }
    setMemoryPhase('show');
    memoryTapsRef.current = [];
    setMemoryTapCount(0);
  }, [memoryRound]);

  useEffect(() => {
    if (!memoryRound) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const cellOnMs = Math.round(memoryRound.showDuration * 0.7);
    const stepMs = cellOnMs + SEQUENCE_CELL_GAP_MS;

    memoryRound.sequence.forEach((cell, i) => {
      const startAt = PRE_SEQUENCE_PAUSE_MS + i * stepMs;
      timers.push(setTimeout(() => setMemoryActiveCell(cell), startAt));
      timers.push(setTimeout(() => setMemoryActiveCell(null), startAt + cellOnMs));
    });

    const showEnd =
      PRE_SEQUENCE_PAUSE_MS +
      Math.max(0, memoryRound.sequence.length * stepMs - SEQUENCE_CELL_GAP_MS) +
      PRE_INPUT_PAUSE_MS;
    timers.push(setTimeout(() => setMemoryPhase('input'), showEnd));

    return () => timers.forEach(clearTimeout);
  }, [memoryRound]);

  useEffect(() => {
    if (round?.subMode !== 'pattern' || betweenRounds || !round) {
      return;
    }
    setPatternRevealed(true);
    const timer = setTimeout(
      () => setPatternRevealed(false),
      round.round.showDuration,
    );
    return () => clearTimeout(timer);
  }, [round, betweenRounds]);

  const accent = round ? MODE_ACCENT[round.subMode] : MODE_ACCENT.mix;
  const levelRules = round
    ? formatLevelRules(round.subMode, currentLevel, t)
    : formatLevelRules('mix', currentLevel, t);

  const onMemoryCellPress = (index: number) => {
    if (memoryPhase !== 'input' || betweenRounds || !memoryRound) {
      return;
    }
    const taps = [...memoryTapsRef.current, index];
    memoryTapsRef.current = taps;
    setMemoryTapCount(taps.length);
    setMemoryActiveCell(index);
    setTimeout(() => setMemoryActiveCell(null), 180);
    if (taps.length >= memoryRound.sequence.length) {
      submit({ subMode: 'memory', value: taps });
    }
  };

  const renderRound = () => {
    if (!round) {
      return null;
    }

    switch (round.subMode) {
      case 'reflex':
        return (
          <>
            <Text style={styles.promptLabel}>{t('game.reflexPrompt')}</Text>
            <Text style={styles.prompt}>{round.round.prompt}</Text>
            <View style={styles.options}>
              {round.round.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[styles.reflexTile, { backgroundColor: opt.hex }]}
                  onPress={() => submit({ subMode: 'reflex', value: opt.id })}
                  accessibilityRole="button"
                  accessibilityLabel={opt.label}
                />
              ))}
            </View>
          </>
        );

      case 'memory': {
        const cols = columnsFor(round.round.gridSize);
        const hint = betweenRounds
          ? t('game.memoryBetween')
          : memoryPhase === 'show'
            ? t('game.memoryWatch')
            : t('game.memoryRepeat', {
                current: memoryTapCount,
                total: round.round.sequence.length,
              });

        return (
          <>
            <Text style={styles.hint}>{hint}</Text>
            <View style={[styles.memoryGrid, { maxWidth: cols * 80 }]}>
              {Array.from({ length: round.round.gridSize }, (_, i) => (
                <Pressable
                  key={i}
                  disabled={memoryPhase !== 'input' || betweenRounds}
                  onPress={() => onMemoryCellPress(i)}
                  style={[
                    styles.memoryCell,
                    !betweenRounds && memoryActiveCell === i
                      ? { backgroundColor: colors.orange500 }
                      : { backgroundColor: colors.bgElevated },
                  ]}
                  accessibilityRole="button"
                />
              ))}
            </View>
          </>
        );
      }

      case 'pattern':
        if (betweenRounds) {
          return <Text style={styles.hint}>{t('game.patternBetween')}</Text>;
        }
        if (patternRevealed) {
          return (
            <>
              <Text style={styles.hint}>{t('game.patternMemorize')}</Text>
              <PatternGrid cells={round.round.target} tile={56} active />
            </>
          );
        }
        return (
          <>
            <Text style={styles.hint}>{t('game.patternWhich')}</Text>
            <View style={styles.patternOptions}>
              {round.round.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => submit({ subMode: 'pattern', value: opt.id })}
                  style={styles.patternOptionCard}
                  accessibilityRole="button"
                >
                  <PatternGrid cells={opt.cells} tile={28} active={false} />
                </Pressable>
              ))}
            </View>
          </>
        );

      case 'colorConflict':
        return (
          <>
            <Text style={styles.hint}>{t('game.colorConflictHint')}</Text>
            <View
              style={[
                styles.colorStage,
                { backgroundColor: round.round.backgroundHex },
              ]}
            >
              <View
                style={[
                  styles.colorShape,
                  { backgroundColor: round.round.shapeColorHex },
                ]}
              />
            </View>
            <View style={styles.options}>
              {round.round.options.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[styles.colorTile, { backgroundColor: opt.hex }]}
                  onPress={() =>
                    submit({ subMode: 'colorConflict', value: opt.id })
                  }
                  accessibilityRole="button"
                />
              ))}
            </View>
          </>
        );

      case 'oddOneOut': {
        const cols = columnsFor(round.round.gridSize);
        return (
          <>
            <Text style={styles.hint}>{t('game.oddOneOutHint')}</Text>
            <View style={[styles.oddGrid, { maxWidth: cols * 84 }]}>
              {round.round.items.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.oddCell, { backgroundColor: item.hex }]}
                  onPress={() =>
                    submit({ subMode: 'oddOneOut', value: item.id })
                  }
                  accessibilityRole="button"
                />
              ))}
            </View>
          </>
        );
      }

      case 'mathSnap':
        return (
          <>
            <Text style={styles.promptLabel}>
              {t(`game.mathSnapHints.${round.round.kind}`)}
            </Text>
            <Text style={styles.prompt}>{round.round.prompt}</Text>
            <View style={styles.mathOptions}>
              {round.round.options.map((opt) => {
                const label = formatMathSnapOptionLabel(
                  opt,
                  round.round.kind,
                  t,
                );
                return (
                  <Pressable
                    key={opt.id}
                    style={styles.mathBtn}
                    onPress={() => submit({ subMode: 'mathSnap', value: opt.id })}
                    accessibilityRole="button"
                  >
                    <Text style={styles.mathBtnText}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        );

      case 'direction':
        return (
          <DirectionPromptPad
            round={round.round}
            accentColor={MODE_ACCENT.direction}
            onSelect={(dir) => submit({ subMode: 'direction', value: dir })}
            disabled={betweenRounds}
          />
        );
    }
  };

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
        levelRules={levelRules}
        accentColor={accent}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          <Text style={[styles.subModeBadge, { color: accent }]}>
            {t('game.mixSubMode', { mode: t(`modes.${round.subMode}.label`) })}
          </Text>
          {renderRound()}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  subModeBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hint: { color: colors.textMuted, fontSize: typography.body.fontSize },
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
  reflexTile: { width: 88, height: 88, borderRadius: radius.lg },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  memoryCell: { width: 68, height: 68, borderRadius: radius.md },
  patternGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  patternCell: { borderRadius: radius.sm },
  patternOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  patternOptionCard: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    backgroundColor: colors.bgSurface,
  },
  colorStage: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorShape: { width: 110, height: 110, borderRadius: radius.md },
  colorTile: { width: 64, height: 64, borderRadius: radius.lg },
  oddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  oddCell: { width: 72, height: 72, borderRadius: radius.md },
  mathOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mathBtn: {
    minWidth: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
  mathBtnText: {
    color: colors.textPrimary,
    fontSize: typography.heading3.fontSize,
    fontWeight: '800',
    textAlign: 'center',
  },
});
