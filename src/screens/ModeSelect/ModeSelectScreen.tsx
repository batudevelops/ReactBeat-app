import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { showRewardedAd } from '../../services/monetization';
import { useMonetizationStore, useUserStore } from '../../stores';
import { colors, spacing, typography } from '../../theme';

export function ModeSelectScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ModeSelect'>>();
  const { t, i18n } = useTranslation();
  const { mode } = route.params;
  const [adBusy, setAdBusy] = useState(false);

  const isPremium = useUserStore((s) => s.isPremium);
  const bonusLives = useMonetizationStore((s) => s.bonusLives);
  const addBonusLives = useMonetizationStore((s) => s.addBonusLives);
  const best = useUserStore((s) => s.bestScores[mode]);
  const { myRank, loading } = useLeaderboard('weekly', mode);

  const bestLabel =
    best > 0 ? best.toLocaleString(i18n.language) : '—';
  const rankLabel =
    loading || myRank == null ? '—' : `#${myRank}`;

  async function handleWatchAd() {
    setAdBusy(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
        addBonusLives();
      }
    } finally {
      setAdBusy(false);
    }
  }

  return (
    <SafeLayout>
      <Header title={t(`modes.${mode}.label`)} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.desc}>{t(`modes.${mode}.description`)}</Text>

        <Card style={styles.stats}>
          <Text style={styles.statLine}>
            {t('modeSelect.personalBest', { value: bestLabel })}
          </Text>
          <Text style={styles.statLine}>
            {t('modeSelect.weeklyRank', { value: rankLabel })}
          </Text>
          {!isPremium && bonusLives > 0 ? (
            <Text style={styles.bonusLine}>
              {t('modeSelect.bonusLives', { count: bonusLives })}
            </Text>
          ) : null}
        </Card>

        <View style={styles.spacer} />

        {!isPremium ? (
          <Button
            label={t('modeSelect.watchAd')}
            variant="secondary"
            loading={adBusy}
            onPress={() => void handleWatchAd()}
          />
        ) : null}
        <Button
          label={t('modeSelect.play')}
          onPress={() => navigation.navigate('Game', { mode, level: 1 })}
        />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  stats: {
    gap: spacing.sm,
  },
  statLine: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  bonusLine: {
    color: colors.orange500,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
});
