import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { RecordCelebration } from '../../components/game/RecordCelebration';
import { Badge, Button, Card, Modal } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { showInterstitialAd } from '../../services/monetization';
import { getRemoteConfig } from '../../services/firebase/remoteConfig';
import { useUserStore } from '../../stores';
import { colors, spacing, typography } from '../../theme';

const TOP_RANK_LOGIN_THRESHOLD = 10;

export function ResultScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { t, i18n } = useTranslation();
  const { user, linkGoogle, linkApple } = useAuth();
  const isPremium = useUserStore((s) => s.isPremium);
  const totalGames = useUserStore((s) => s.totalGames);
  const { mode, score, isNewRecord, correct, wrong, avgReactionMs, level } =
    route.params;

  const { myRank, loading: rankLoading } = useLeaderboard('weekly', mode, {
    scoreHint: score,
  });

  const displayRank = route.params.rank ?? myRank;
  const isAnonymous = user?.isAnonymous ?? true;
  const showLoginPrompt =
    !rankLoading &&
    displayRank != null &&
    displayRank <= TOP_RANK_LOGIN_THRESHOLD &&
    isAnonymous;

  const [loginModal, setLoginModal] = useState(false);
  const [linkBusy, setLinkBusy] = useState<null | 'google' | 'apple'>(null);

  useEffect(() => {
    if (showLoginPrompt) {
      setLoginModal(true);
    }
  }, [showLoginPrompt]);

  useEffect(() => {
    if (isPremium || totalGames === 0) {
      return;
    }
    const threshold = getRemoteConfig().interstitial_threshold;
    if (totalGames % threshold !== 0) {
      return;
    }
    void showInterstitialAd();
  }, [isPremium, totalGames]);

  async function handleLink(provider: 'google' | 'apple') {
    setLinkBusy(provider);
    try {
      if (provider === 'google') {
        await linkGoogle();
      } else {
        await linkApple();
      }
      setLoginModal(false);
    } catch {
      // Profile screen shows detailed errors; keep modal open here.
    } finally {
      setLinkBusy(null);
    }
  }

  return (
    <SafeLayout>
      <View style={styles.body}>
        {isNewRecord ? (
          <>
            <RecordCelebration />
            <Badge label={t('result.newRecord')} tone="special" />
          </>
        ) : null}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>
            {t('result.scoreLabel', { mode: t(`modes.${mode}.label`) })}
          </Text>
          <Text style={styles.score}>{score.toLocaleString(i18n.language)}</Text>
        </View>

        <Card style={styles.stats}>
          <Text style={styles.statLine}>
            {t('result.correctWrong', { correct: correct ?? '—', wrong: wrong ?? '—' })}
          </Text>
          <Text style={styles.statLine}>
            {avgReactionMs == null
              ? t('result.avgReactionEmpty')
              : t('result.avgReaction', { ms: avgReactionMs })}
          </Text>
          {displayRank == null ? null : (
            <Text style={styles.statLine}>
              {t('result.weeklyRank', { rank: displayRank })}
            </Text>
          )}
        </Card>

        <View style={styles.spacer} />

        <Button
          label={t('result.playAgain')}
          onPress={() => navigation.replace('Game', { mode, level: level ?? 1 })}
        />
        <Button
          label={t('result.viewLeaderboard')}
          variant="secondary"
          onPress={() => navigation.navigate('Leaderboard', { mode })}
        />
        <Button
          label={t('result.mainMenu')}
          variant="ghost"
          onPress={() => navigation.popToTop()}
        />
      </View>

      <Modal
        visible={loginModal}
        onClose={() => setLoginModal(false)}
        title={t('result.saveScoreTitle')}
        dismissable
      >
        <Text style={styles.modalBody}>{t('result.saveScoreBody', { rank: displayRank })}</Text>
        <Button
          label={linkBusy === 'google' ? t('profile.linking') : t('profile.linkGoogle')}
          variant="secondary"
          disabled={linkBusy !== null}
          onPress={() => handleLink('google')}
        />
        {Platform.OS === 'ios' ? (
          <Button
            label={linkBusy === 'apple' ? t('profile.linking') : t('profile.linkApple')}
            variant="secondary"
            disabled={linkBusy !== null}
            onPress={() => handleLink('apple')}
          />
        ) : null}
        <Button
          label={t('result.saveScoreDismiss')}
          variant="ghost"
          onPress={() => setLoginModal(false)}
        />
      </Modal>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.md, paddingTop: spacing.lg },
  scoreBox: { alignItems: 'center', gap: spacing.xs },
  scoreLabel: { color: colors.textMuted, fontSize: typography.body.fontSize },
  score: {
    color: colors.amber400,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
  },
  stats: { gap: spacing.sm },
  statLine: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  spacer: { flex: 1 },
  modalBody: { color: colors.textSecondary, fontSize: typography.body.fontSize },
});
