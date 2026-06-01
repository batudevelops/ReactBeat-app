import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useUserStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';
import { GAME_MODES, MODE_META } from '../../types/game';

export function HomeScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { t } = useTranslation();
  const displayName = useUserStore((s) => s.displayName) || t('profile.defaultName');
  const streak = useUserStore((s) => s.streak);
  const isPremium = useUserStore((s) => s.isPremium);

  return (
    <SafeLayout>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.hello}>{t('home.greeting', { name: displayName })}</Text>
          <Text style={styles.streak}>{t('home.streak', { value: streak })}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.modes}>
        {GAME_MODES.map((mode) => {
          const meta = MODE_META[mode];
          const locked = meta.premium && !isPremium;
          return (
            <Pressable
              key={mode}
              style={styles.modeCard}
              onPress={() =>
                locked
                  ? navigation.navigate('Paywall')
                  : navigation.navigate('ModeSelect', { mode })
              }
            >
              <View style={styles.modeTop}>
                <Text style={styles.modeLabel}>{t(`modes.${mode}.label`)}</Text>
                {meta.premium ? (
                  <Badge label={locked ? '🔒 Premium' : 'Premium'} tone="special" />
                ) : null}
              </View>
              <Text style={styles.modeDesc}>{t(`modes.${mode}.description`)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable onPress={() => navigation.navigate('Leaderboard', {})}>
          <Text style={styles.barItem}>{t('home.leaderboard')}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.barItem}>{t('home.profile')}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.barItem}>⚙️</Text>
        </Pressable>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingVertical: spacing.md,
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
  modes: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  modeCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    padding: spacing.md,
    gap: spacing.xs,
  },
  modeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeLabel: {
    color: colors.textPrimary,
    fontSize: typography.heading3.fontSize,
    fontWeight: '700',
  },
  modeDesc: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bgBorder,
  },
  barItem: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});
