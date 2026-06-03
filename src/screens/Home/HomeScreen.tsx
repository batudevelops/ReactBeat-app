import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/ui';
import { BottomNavBar } from '../../components/shared/BottomNavBar';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useLivesRegen } from '../../hooks/useLivesRegen';
import { useProgressStore, useUserStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';
import {
  isModeLocked,
  MODE_ACCENT,
  MODE_META,
  QUICK_PLAY_MODE,
  SKILL_GROUPS,
  type GameMode,
} from '../../types/game';

function withAlpha(hex: string, alpha: number): string {
  const value = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${value}`;
}

function ModeCard({
  mode,
  level,
  locked,
  featured = false,
  onPress,
}: Readonly<{
  mode: GameMode;
  level: number;
  locked: boolean;
  featured?: boolean;
  onPress: () => void;
}>) {
  const { t } = useTranslation();
  const meta = MODE_META[mode];
  const accent = MODE_ACCENT[mode];

  return (
    <Pressable
      style={({ pressed }) => [
        featured ? styles.featuredCell : styles.modeCell,
        pressed && styles.modeCardPressed,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[withAlpha(accent, featured ? 0.45 : 0.38), colors.bgSurface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[styles.modeCard, { borderColor: withAlpha(accent, 0.35) }]}
      >
        <View style={[styles.modeAccentBar, { backgroundColor: accent }]} />
        <View style={styles.modeCardBody}>
          <View style={styles.modeHeader}>
            <View style={styles.modeHeaderLeft}>
              {featured ? (
                <Badge label={t('home.quickPlay')} tone="special" />
              ) : (
                <View style={[styles.modeDot, { backgroundColor: accent }]} />
              )}
            </View>
            {meta.premium ? (
              <Badge label={locked ? '🔒' : '★'} tone="special" />
            ) : null}
          </View>
          <View style={styles.modeTextBlock}>
            <Text style={[styles.modeLabel, featured && styles.modeLabelFeatured]} numberOfLines={2}>
              {t(`modes.${mode}.label`)}
            </Text>
            <Text style={styles.modeDesc} numberOfLines={featured ? 2 : 3}>
              {t(`modes.${mode}.description`)}
            </Text>
          </View>
          <Text style={[styles.modeLevel, { color: accent }]}>
            {t('level.label', { level })}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { t } = useTranslation();
  const displayName = useUserStore((s) => s.displayName) || t('profile.defaultName');
  const streak = useUserStore((s) => s.streak);
  const isPremium = useUserStore((s) => s.isPremium);
  const { remaining, regenCap, regenCountdown } = useLivesRegen();
  const levelByMode = useProgressStore((s) => s.levelByMode);

  function openMode(mode: GameMode) {
    if (isModeLocked(mode, isPremium)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('ModeSelect', { mode });
  }

  return (
    <SafeLayout edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.hello}>{t('home.greeting', { name: displayName })}</Text>
          <Text style={styles.streak}>{t('home.streak', { value: streak })}</Text>
        </View>
        {!isPremium ? (
          <View style={styles.livesWrap}>
            <Text style={styles.lives}>
              {t('home.lives', { current: remaining, max: regenCap })}
            </Text>
            {regenCountdown ? (
              <Text style={styles.regenHint}>
                {t('lives.nextIn', { time: regenCountdown })}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ModeCard
          mode={QUICK_PLAY_MODE}
          level={levelByMode[QUICK_PLAY_MODE]}
          locked={false}
          featured
          onPress={() => openMode(QUICK_PLAY_MODE)}
        />

        {SKILL_GROUPS.map((group) => (
          <View key={group.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{t(group.labelKey)}</Text>
            <View style={styles.modesGrid}>
              {group.modes.map((mode) => (
                <ModeCard
                  key={mode}
                  mode={mode}
                  level={levelByMode[mode]}
                  locked={isModeLocked(mode, isPremium)}
                  onPress={() => openMode(mode)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNavBar
        items={[
          {
            key: 'leaderboard',
            icon: '🏆',
            label: t('home.nav.leaderboard'),
            onPress: () => navigation.navigate('Leaderboard', {}),
          },
          {
            key: 'profile',
            icon: '👤',
            label: t('home.nav.profile'),
            onPress: () => navigation.navigate('Profile'),
          },
          {
            key: 'settings',
            icon: '⚙️',
            label: t('home.nav.settings'),
            onPress: () => navigation.navigate('Settings'),
          },
        ]}
      />
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  livesWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  lives: {
    color: colors.orange400,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  regenHint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  hello: {
    color: colors.textPrimary,
    fontSize: typography.heading2.fontSize,
    fontWeight: '700',
  },
  streak: {
    color: colors.amber400,
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
  },
  scrollContent: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  featuredCell: {
    width: '100%',
    minHeight: 132,
  },
  modeCell: {
    width: '48%',
    aspectRatio: 1,
  },
  modeCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modeAccentBar: {
    height: 4,
    width: '100%',
  },
  modeCardBody: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  modeCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  modeTextBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  modeLabel: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '800',
    lineHeight: 20,
  },
  modeLabelFeatured: {
    fontSize: typography.heading3.fontSize,
  },
  modeDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  modeLevel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
});
