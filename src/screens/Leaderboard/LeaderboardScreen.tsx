import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { colors, radius, spacing, typography } from '../../theme';
import { GAME_MODES, MODE_META, type GameMode, type Period } from '../../types/game';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Günlük' },
  { key: 'weekly', label: 'Haftalık' },
  { key: 'alltime', label: 'Tüm' },
];

export function LeaderboardScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Leaderboard'>>();

  const [period, setPeriod] = useState<Period>('weekly');
  const [mode, setMode] = useState<GameMode>(route.params?.mode ?? 'reflex');

  return (
    <SafeLayout>
      <Header title="Liderlik Tablosu" onBack={() => navigation.goBack()} />

      <View style={styles.tabRow}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.key}
            style={[styles.tab, period === p.key && styles.tabActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.tabText, period === p.key && styles.tabTextActive]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeRow}
      >
        {GAME_MODES.map((m) => (
          <Pressable
            key={m}
            style={[styles.chip, mode === m && styles.chipActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.chipText, mode === m && styles.chipTextActive]}>
              {MODE_META[m].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {MODE_META[mode].label} · {period}
        </Text>
        <Text style={styles.placeholderMuted}>
          Liste Faz 7'de Realtime DB'den gelecek.
        </Text>
      </View>

      <View style={styles.myRank}>
        <Text style={styles.myRankText}>Senin sıran: — </Text>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.orange500 },
  tabText: { color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.textPrimary },
  modeRow: { gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
  },
  chipActive: { backgroundColor: colors.info },
  chipText: { color: colors.textSecondary, fontSize: typography.caption.fontSize },
  chipTextActive: { color: colors.textPrimary },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  placeholderText: { color: colors.textPrimary, fontSize: typography.heading3.fontSize },
  placeholderMuted: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  myRank: {
    borderTopWidth: 1,
    borderTopColor: colors.bgBorder,
    paddingVertical: spacing.md,
  },
  myRankText: { color: colors.textSecondary, fontSize: typography.body.fontSize },
});
