import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { RecordCelebration } from '../../components/game/RecordCelebration';
import { Badge, Button, Card, Modal } from '../../components/ui';
import { ScreenFooter } from '../../components/shared/BottomNavBar';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { isAuthCancelledError } from '../../services/firebase/auth';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useLivesRegen } from '../../hooks/useLivesRegen';
import { showInterstitialAd, showRewardedAd } from '../../services/monetization';
import { getRemoteConfig } from '../../services/firebase/remoteConfig';
import {
  getStartLevel,
  hasLivesToPlay,
  MAX_LIVES,
  useLivesStore,
  useUserStore,
} from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';

const TOP_RANK_LOGIN_THRESHOLD = 10;

function scoreSaveMessage(
  reasons: string[] | undefined,
  t: (key: string) => string,
): string {
  const reason = reasons?.[0];
  if (reason) {
    const key = `result.scoreSaveReasons.${reason}`;
    const translated = t(key);
    if (translated !== key) {
      return translated;
    }
  }
  return t('result.scoreSaveFailedGeneric');
}

export function ResultScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { t, i18n } = useTranslation();
  const { user, linkGoogle, linkApple } = useAuth();
  const isPremium = useUserStore((s) => s.isPremium);
  const totalGames = useUserStore((s) => s.totalGames);
  const remainingLives = useLivesStore((s) => s.remaining);
  const addLife = useLivesStore((s) => s.addLife);
  const { regenCap, regenCountdown } = useLivesRegen();
  const { mode, score, isNewRecord, correct, wrong, avgReactionMs, level, scoreSaved, scoreSaveReasons } =
    route.params;

  const canPlay = hasLivesToPlay(isPremium);
  const atMaxLives = !isPremium && remainingLives >= MAX_LIVES;
  const startLevel = getStartLevel(mode);

  const [adBusy, setAdBusy] = useState(false);
  const { myRank, loading: rankLoading } = useLeaderboard('weekly', mode, {
    scoreHint: score,
  });

  const displayRank =
    scoreSaved === true ? (route.params.rank ?? myRank) : null;
  const showScoreSaveWarning = score > 0 && scoreSaved === false;
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
    if (!isAnonymous) {
      setLoginModal(false);
    }
  }, [isAnonymous]);

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

  async function handleLink(provider: 'google' | 'apple') {
    setLinkBusy(provider);
    try {
      if (provider === 'google') {
        await linkGoogle();
      } else {
        await linkApple();
      }
      setLoginModal(false);
    } catch (e) {
      if (isAuthCancelledError(e)) {
        return;
      }
      const message =
        (e as { message?: string }).message ?? t('profile.linkFailBody');
      Alert.alert(t('profile.linkFailTitle'), message);
    } finally {
      setLinkBusy(null);
    }
  }

  return (
    <SafeLayout edges={['top', 'left', 'right']}>
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
          {showScoreSaveWarning ? (
            <View style={styles.saveWarning}>
              <Text style={styles.saveWarningTitle}>
                {t('result.scoreSaveFailedTitle')}
              </Text>
              <Text style={styles.saveWarningBody}>
                {scoreSaveMessage(scoreSaveReasons, t)}
              </Text>
            </View>
          ) : null}
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
          {level != null ? (
            <Text style={styles.statLine}>
              {t('result.levelReached', { level })}
            </Text>
          ) : null}
          {!isPremium ? (
            <>
              <Text style={styles.livesLine}>
                {t('modeSelect.lives', {
                  current: remainingLives,
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
          {!isPremium && !canPlay ? (
            <Text style={styles.noLivesLine}>
              {regenCountdown
                ? t('modeSelect.noLivesRegen', { time: regenCountdown })
                : t('modeSelect.noLivesHint')}
            </Text>
          ) : null}
        </Card>

        <View style={styles.spacer} />
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
          label={canPlay ? t('result.playAgain') : t('modeSelect.noLivesPlay')}
          disabled={!canPlay}
          onPress={() =>
            navigation.replace('Game', { mode, level: startLevel })
          }
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
      </ScreenFooter>

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
  saveWarning: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${colors.error}18`,
    borderWidth: 1,
    borderColor: `${colors.error}44`,
  },
  saveWarningTitle: {
    color: colors.error,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  saveWarningBody: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  statLine: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  livesLine: {
    color: colors.orange400,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  regenLine: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  noLivesLine: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  spacer: { flex: 1 },
  modalBody: { color: colors.textSecondary, fontSize: typography.body.fontSize },
});
