import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar } from '../../components/ui';
import { Loader } from '../../components/shared/Loader';
import { ScreenFooter } from '../../components/shared/BottomNavBar';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useUserStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';
import {
  isModeLocked,
  LEADERBOARD_GROUPS,
  MODE_ACCENT,
  type GameMode,
  type LeaderboardGroupId,
  type Period,
} from '../../types/game';
import type { LeaderboardEntry } from '../../types/leaderboard';

const PERIOD_KEYS: Period[] = ['daily', 'weekly', 'alltime'];

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'] as const;
const PODIUM_HEIGHTS = [96, 72, 58] as const;

function rankLabel(rank: number): string {
  if (rank >= 1 && rank <= 3) {
    return PODIUM_MEDALS[rank - 1];
  }
  return `#${rank}`;
}

function PodiumSlot({
  entry,
  rank,
  isMe,
}: Readonly<{ entry: LeaderboardEntry; rank: number; isMe: boolean }>) {
  const { i18n, t } = useTranslation();
  const height = PODIUM_HEIGHTS[rank - 1] ?? PODIUM_HEIGHTS[2];

  return (
    <View style={styles.podiumSlot}>
      <Text style={styles.podiumMedal}>{PODIUM_MEDALS[rank - 1]}</Text>
      <Avatar index={entry.avatar} size={rank === 1 ? 52 : 44} selected={isMe} />
      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.name}
        {isMe ? ` (${t('leaderboard.you')})` : ''}
      </Text>
      <Text style={styles.podiumScore}>
        {entry.score.toLocaleString(i18n.language)}
      </Text>
      <View
        style={[
          styles.podiumBar,
          {
            height,
            backgroundColor:
              rank === 1 ? colors.amber500 : rank === 2 ? colors.textMuted : colors.orange700,
          },
          isMe && styles.podiumBarMe,
        ]}
      >
        <Text style={styles.podiumRank}>{rank}</Text>
      </View>
    </View>
  );
}

function Podium({
  entries,
  myUid,
}: Readonly<{ entries: LeaderboardEntry[]; myUid?: string }>) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) {
    return null;
  }

  const slots = [
    { entry: top3[1], rank: 2 },
    { entry: top3[0], rank: 1 },
    { entry: top3[2], rank: 3 },
  ];

  return (
    <View style={styles.podium}>
      {slots.map(({ entry, rank }) => (
        <PodiumSlot
          key={entry.uid}
          entry={entry}
          rank={rank}
          isMe={entry.uid === myUid}
        />
      ))}
    </View>
  );
}

function RankRow({
  entry,
  rank,
  isMe,
  accentColor,
}: Readonly<{
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  accentColor: string;
}>) {
  const { i18n } = useTranslation();

  return (
    <View
      style={[
        styles.row,
        isMe && { borderColor: accentColor, backgroundColor: `${accentColor}18` },
      ]}
    >
      <Text style={[styles.rowRank, rank <= 3 && styles.rowRankTop]}>
        {rankLabel(rank)}
      </Text>
      <Avatar index={entry.avatar} size={40} selected={isMe} />
      <View style={styles.rowMid}>
        <Text style={styles.rowName} numberOfLines={1}>
          {entry.name}
        </Text>
      </View>
      <Text style={styles.rowScore}>{entry.score.toLocaleString(i18n.language)}</Text>
    </View>
  );
}

function resolveInitialGroup(mode: GameMode): LeaderboardGroupId {
  for (const group of LEADERBOARD_GROUPS) {
    if (group.modes.includes(mode)) {
      return group.id;
    }
  }
  return 'speed';
}

export function LeaderboardScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Leaderboard'>>();
  const { t, i18n } = useTranslation();

  const isPremium = useUserStore((s) => s.isPremium);
  const profileName = useUserStore((s) => s.displayName);
  const profileAvatar = useUserStore((s) => s.avatar);
  const { user } = useAuth();

  const initialMode = route.params?.mode ?? 'reflex';
  const [period, setPeriod] = useState<Period>('weekly');
  const [groupId, setGroupId] = useState<LeaderboardGroupId>(() =>
    resolveInitialGroup(initialMode),
  );
  const [mode, setMode] = useState<GameMode>(initialMode);

  const activeGroup = LEADERBOARD_GROUPS.find((g) => g.id === groupId) ?? LEADERBOARD_GROUPS[0];

  useEffect(() => {
    if (!activeGroup.modes.includes(mode)) {
      setMode(activeGroup.modes[0]);
    }
  }, [activeGroup, mode]);

  const { entries, myRank, myEntry, loading, error, maxVisible } = useLeaderboard(
    period,
    mode,
  );

  const accent = MODE_ACCENT[mode];
  const showPodium = entries.length >= 3;
  const listEntries = showPodium ? entries.slice(3) : entries;

  const footerName = myEntry?.name || profileName || t('profile.defaultName');
  const footerScore = myEntry?.score;
  const footerAvatar = myEntry?.avatar ?? profileAvatar;

  const periodLabel = t(`leaderboard.${period}`);
  const modeLabel = t(`modes.${mode}.label`);

  const listHeader = useMemo(() => {
    if (loading || error || entries.length === 0) {
      return null;
    }

    return (
      <View style={styles.listHeader}>
        {showPodium ? <Podium entries={entries} myUid={user?.uid} /> : null}
        {listEntries.length > 0 ? (
          <Text style={styles.sectionTitle}>
            {showPodium ? t('leaderboard.restOfTop', { count: maxVisible }) : periodLabel}
          </Text>
        ) : null}
      </View>
    );
  }, [
    loading,
    error,
    entries,
    showPodium,
    listEntries.length,
    user?.uid,
    t,
    maxVisible,
    periodLabel,
  ]);

  function handlePeriodChange(next: Period) {
    if (next === 'alltime' && !isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    setPeriod(next);
  }

  function handleGroupChange(next: LeaderboardGroupId) {
    setGroupId(next);
    const nextGroup = LEADERBOARD_GROUPS.find((g) => g.id === next);
    if (nextGroup) {
      setMode(nextGroup.modes[0]);
    }
  }

  function handleModeChange(next: GameMode) {
    if (isModeLocked(next, isPremium)) {
      navigation.navigate('Paywall');
      return;
    }
    setMode(next);
  }

  return (
    <SafeLayout edges={['top', 'left', 'right']}>
      <Header title={t('leaderboard.title')} onBack={() => navigation.goBack()} />

      <Text style={styles.subtitle}>
        {modeLabel} · {periodLabel}
      </Text>

      <View style={styles.periodRow}>
        {PERIOD_KEYS.map((p) => {
          const locked = p === 'alltime' && !isPremium;
          const active = period === p;
          return (
            <Pressable
              key={p}
              style={[styles.periodTab, active && styles.periodTabActive]}
              onPress={() => handlePeriodChange(p)}
            >
              <Text style={[styles.periodText, active && styles.periodTextActive]}>
                {t(`leaderboard.${p}`)}
                {locked ? ' 🔒' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.groupRow}>
        {LEADERBOARD_GROUPS.map((group) => {
          const active = groupId === group.id;
          return (
            <Pressable
              key={group.id}
              style={[styles.groupTab, active && styles.groupTabActive]}
              onPress={() => handleGroupChange(group.id)}
            >
              <Text style={[styles.groupText, active && styles.groupTextActive]}>
                {t(group.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeGroup.modes.length > 1 ? (
        <View style={styles.modeRow}>
          {activeGroup.modes.map((m) => {
            const locked = isModeLocked(m, isPremium);
            const active = mode === m;
            const modeAccent = MODE_ACCENT[m];

            return (
              <Pressable
                key={m}
                style={[
                  styles.modeChip,
                  active && {
                    borderColor: modeAccent,
                    backgroundColor: `${modeAccent}22`,
                  },
                ]}
                onPress={() => handleModeChange(m)}
              >
                <View style={[styles.modeDot, { backgroundColor: modeAccent }]} />
                <Text
                  style={[
                    styles.modeChipText,
                    active && { color: colors.textPrimary },
                  ]}
                >
                  {t(`modes.${m}.label`)}
                  {locked ? ' 🔒' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.listWrap}>
        {loading ? (
          <View style={styles.center}>
            <Loader />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={listEntries}
            keyExtractor={(item) => item.uid}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              entries.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyEmoji}>🏆</Text>
                  <Text style={styles.emptyTitle}>{t('leaderboard.emptyTitle')}</Text>
                  <Text style={styles.empty}>{t('leaderboard.empty')}</Text>
                </View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <RankRow
                entry={item}
                rank={showPodium ? index + 4 : index + 1}
                isMe={myEntry?.uid === item.uid}
                accentColor={accent}
              />
            )}
          />
        )}
      </View>

      <ScreenFooter>
        <View style={[styles.myBar, { borderColor: accent }]}>
          <View style={styles.myBarTop}>
            <View style={styles.myRankBadge}>
              <Text style={styles.myRankNum}>
                {myRank == null ? '—' : `#${myRank}`}
              </Text>
            </View>
            <Avatar index={footerAvatar} size={40} selected />
            <View style={styles.myBarMid}>
              <Text style={styles.myBarLabel}>{t('leaderboard.you')}</Text>
              <Text style={styles.myBarName} numberOfLines={1}>
                {footerName}
              </Text>
            </View>
            <Text style={styles.myBarScore}>
              {footerScore == null
                ? '—'
                : footerScore.toLocaleString(i18n.language)}
            </Text>
          </View>
          {myRank == null && myEntry == null ? (
            <Text style={styles.myHint}>{t('leaderboard.notRanked')}</Text>
          ) : null}
        </View>
      </ScreenFooter>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: colors.orange500,
    borderColor: colors.orange500,
  },
  periodText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: typography.caption.fontSize,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  groupTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
  groupTabActive: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.orange400,
  },
  groupText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: typography.caption.fontSize,
  },
  groupTextActive: {
    color: colors.textPrimary,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  modeChipText: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
    gap: spacing.xs,
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 110,
  },
  podiumMedal: {
    fontSize: 18,
  },
  podiumName: {
    color: colors.textPrimary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumScore: {
    color: colors.amber400,
    fontSize: typography.caption.fontSize,
    fontWeight: '800',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  podiumBarMe: {
    borderWidth: 1,
    borderColor: colors.orange400,
  },
  podiumRank: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: typography.heading3.fontSize,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
  rowRank: {
    width: 36,
    color: colors.textSecondary,
    fontWeight: '800',
    fontSize: typography.body.fontSize,
    textAlign: 'center',
  },
  rowRankTop: {
    color: colors.amber400,
  },
  rowMid: {
    flex: 1,
  },
  rowName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  rowScore: {
    color: colors.amber400,
    fontWeight: '800',
    fontSize: typography.body.fontSize,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading3.fontSize,
    fontWeight: '700',
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: typography.body.fontSize,
    paddingHorizontal: spacing.lg,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    fontSize: typography.body.fontSize,
  },
  myBar: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  myBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  myRankBadge: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
  },
  myRankNum: {
    color: colors.orange400,
    fontWeight: '800',
    fontSize: typography.body.fontSize,
  },
  myBarMid: {
    flex: 1,
    gap: 2,
  },
  myBarLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  myBarName: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  myBarScore: {
    color: colors.amber400,
    fontWeight: '800',
    fontSize: typography.heading3.fontSize,
  },
  myHint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
});
