import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar } from '../../components/ui';
import { Loader } from '../../components/shared/Loader';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { colors, radius, spacing, typography } from '../../theme';
import { GAME_MODES, type GameMode, type Period } from '../../types/game';
import type { LeaderboardEntry } from '../../types/leaderboard';

const PERIOD_KEYS: Period[] = ['daily', 'weekly', 'alltime'];

function medalFor(rank: number): string {
  if (rank === 1) {
    return '🥇';
  }
  if (rank === 2) {
    return '🥈';
  }
  if (rank === 3) {
    return '🥉';
  }
  return `${rank}.`;
}

function EntryRow({
  entry,
  rank,
  isMe,
}: Readonly<{ entry: LeaderboardEntry; rank: number; isMe: boolean }>) {
  const { i18n } = useTranslation();
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <Text style={styles.rank}>{medalFor(rank)}</Text>
      <Avatar index={entry.avatar} size={40} />
      <View style={styles.rowMid}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name}
          {isMe ? ' ★' : ''}
        </Text>
      </View>
      <Text style={styles.score}>{entry.score.toLocaleString(i18n.language)}</Text>
    </View>
  );
}

export function LeaderboardScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Leaderboard'>>();
  const { t } = useTranslation();

  const [period, setPeriod] = useState<Period>('weekly');
  const [mode, setMode] = useState<GameMode>(route.params?.mode ?? 'reflex');

  const { entries, myRank, myEntry, loading, error } = useLeaderboard(period, mode);

  let listBody: ReactNode;
  if (loading) {
    listBody = (
      <View style={styles.center}>
        <Loader />
      </View>
    );
  } else if (error) {
    listBody = (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  } else {
    listBody = (
      <FlatList
        data={entries}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>{t('leaderboard.empty')}</Text>}
        renderItem={({ item, index }) => (
          <EntryRow entry={item} rank={index + 1} isMe={myEntry?.uid === item.uid} />
        )}
      />
    );
  }

  return (
    <SafeLayout>
      <Header title={t('leaderboard.title')} onBack={() => navigation.goBack()} />

      <View style={styles.tabRow}>
        {PERIOD_KEYS.map((p) => (
          <Pressable
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
              {t(`leaderboard.${p}`)}
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
              {t(`modes.${m}.label`)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {listBody}

      <View style={styles.myRank}>
        <Text style={styles.myRankText}>
          {myRank == null
            ? t('leaderboard.yourRank')
            : t('leaderboard.yourRankValue', { rank: myRank })}
          {myEntry ? ` — ${myEntry.score.toLocaleString()}` : ''}
        </Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: spacing.sm, gap: spacing.xs, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  rowMe: { backgroundColor: colors.bgElevated },
  rank: { width: 36, color: colors.amber400, fontWeight: '700', fontSize: typography.body.fontSize },
  rowMid: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: '600' },
  score: { color: colors.textSecondary, fontWeight: '700', fontSize: typography.body.fontSize },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    fontSize: typography.body.fontSize,
  },
  error: { color: colors.error, textAlign: 'center' },
  myRank: {
    borderTopWidth: 1,
    borderTopColor: colors.bgBorder,
    paddingVertical: spacing.md,
  },
  myRankText: { color: colors.textSecondary, fontSize: typography.body.fontSize },
});
