import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Modal } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { ScreenFooter } from '../../components/shared/BottomNavBar';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import { formatLevelRules } from '../../engine/levelSummary';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useLivesRegen } from '../../hooks/useLivesRegen';
import { showRewardedAd } from '../../services/monetization';
import {
  hasLivesToPlay,
  MAX_LIVES,
  useLivesStore,
  useProgressStore,
  useUserStore,
} from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';
import { MODE_ACCENT } from '../../types/game';

export function ModeSelectScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ModeSelect'>>();
  const { t, i18n } = useTranslation();
  const { mode } = route.params;
  const [adBusy, setAdBusy] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  const isPremium = useUserStore((s) => s.isPremium);
  const addLife = useLivesStore((s) => s.addLife);
  const resetLevel = useProgressStore((s) => s.resetLevel);
  const { remaining, regenCap, regenCountdown } = useLivesRegen();
  const best = useUserStore((s) => s.bestScores[mode]);
  const { myRank, loading } = useLeaderboard('weekly', mode);
  const startLevel = useProgressStore((s) => s.levelByMode[mode] ?? 1);
  const accent = MODE_ACCENT[mode];
  const levelRules = formatLevelRules(mode, startLevel, t);

  const canPlay = hasLivesToPlay(isPremium);
  const atMaxLives = !isPremium && remaining >= MAX_LIVES;

  const bestLabel =
    best > 0 ? best.toLocaleString(i18n.language) : '—';
  const rankLabel =
    loading || myRank == null ? '—' : `#${myRank}`;

  async function handleWatchAd() {
    setAdBusy(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
        addLife();
      }
    } finally {
      setAdBusy(false);
    }
  }

  return (
    <SafeLayout edges={['top', 'left', 'right']}>
      <Header title={t(`modes.${mode}.label`)} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={[styles.accentStrip, { backgroundColor: accent }]} />
        <Text style={styles.desc}>{t(`modes.${mode}.description`)}</Text>

        <Card style={styles.stats}>
          <View style={[styles.levelChip, { borderColor: accent }]}>
            <View style={styles.levelRow}>
              <Text style={[styles.levelText, { color: accent }]}>
                {t('level.label', { level: startLevel })}
              </Text>
              {startLevel > 1 ? (
                <Pressable
                  onPress={() => setResetModal(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={[styles.resetLink, { color: accent }]}>
                    {t('modeSelect.resetLevel')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.levelRules}>{levelRules}</Text>
          </View>
          {!isPremium ? (
            <>
              <Text style={styles.livesLine}>
                {t('modeSelect.lives', {
                  current: remaining,
                  max: regenCap,
                })}
              </Text>
              {regenCountdown ? (
                <Text style={styles.regenLine}>
                  {t('lives.nextIn', { time: regenCountdown })}
                </Text>
              ) : null}
            </>
          ) : null}
          <Text style={styles.statLine}>
            {t('modeSelect.personalBest', { value: bestLabel })}
          </Text>
          <Text style={styles.statLine}>
            {t('modeSelect.weeklyRank', { value: rankLabel })}
          </Text>
          {!isPremium && !canPlay ? (
            <Text style={styles.noLivesLine}>
              {regenCountdown
                ? t('modeSelect.noLivesRegen', { time: regenCountdown })
                : t('modeSelect.noLivesHint')}
            </Text>
          ) : null}
        </Card>
      </View>

      <ScreenFooter>
        {!isPremium ? (
          <Button
            label={t('modeSelect.watchAd')}
            variant="secondary"
            loading={adBusy}
            disabled={atMaxLives}
            onPress={() => void handleWatchAd()}
          />
        ) : null}
        <Button
          label={canPlay ? t('modeSelect.play') : t('modeSelect.noLivesPlay')}
          disabled={!canPlay}
          onPress={() =>
            navigation.navigate('Game', { mode, level: startLevel })
          }
        />
      </ScreenFooter>

      <Modal
        visible={resetModal}
        onClose={() => setResetModal(false)}
        title={t('modeSelect.resetLevelTitle')}
        dismissable
      >
        <Text style={styles.resetBody}>
          {t('modeSelect.resetLevelBody', {
            level: startLevel,
            mode: t(`modes.${mode}.label`),
          })}
        </Text>
        <Button
          label={t('modeSelect.resetLevelConfirm')}
          onPress={() => {
            resetLevel(mode);
            setResetModal(false);
          }}
        />
        <Button
          label={t('modeSelect.resetLevelCancel')}
          variant="ghost"
          onPress={() => setResetModal(false)}
        />
      </Modal>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  accentStrip: {
    height: 4,
    borderRadius: radius.full,
    width: 56,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  stats: {
    gap: spacing.sm,
  },
  levelChip: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelText: {
    fontSize: typography.heading3.fontSize,
    fontWeight: '800',
  },
  resetLink: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  resetBody: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  levelRules: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  livesLine: {
    color: colors.orange400,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  regenLine: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  statLine: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  noLivesLine: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
});
