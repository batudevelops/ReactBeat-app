import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import { ComboIndicator } from './ComboIndicator';
import { LevelUpToast } from './LevelUpToast';
import { LivesBar } from './LivesBar';
import { ScoreDisplay } from './ScoreDisplay';
import { TimerBar } from './TimerBar';

interface GameHudProps {
  score: number;
  combo: number;
  lives: number;
  maxLives?: number;
  msLeft: number;
  timeLimit: number;
  level?: number;
  levelRules?: string;
  accentColor?: string;
  levelUpToken?: number;
}

export function GameHud({
  score,
  combo,
  lives,
  maxLives = 3,
  msLeft,
  timeLimit,
  level,
  levelRules,
  accentColor = colors.orange500,
  levelUpToken = 0,
}: GameHudProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {level != null && levelUpToken > 0 ? (
        <LevelUpToast
          token={levelUpToken}
          level={level}
          label={t('level.upToast')}
          accentColor={accentColor}
        />
      ) : null}
      {level != null ? (
        <View style={[styles.levelRow, { borderColor: accentColor }]}>
          <Text style={[styles.levelBadge, { color: accentColor }]}>
            Lv.{level}
          </Text>
          {levelRules ? (
            <Text style={styles.levelRules} numberOfLines={1}>
              {levelRules}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.topRow}>
        <ScoreDisplay score={score} />
        <ComboIndicator combo={combo} />
        <LivesBar lives={lives} max={maxLives} />
      </View>
      <TimerBar msLeft={msLeft} timeLimit={timeLimit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'relative',
    zIndex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.bgSurface,
    maxWidth: '100%',
  },
  levelBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: '800',
  },
  levelRules: {
    flexShrink: 1,
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
