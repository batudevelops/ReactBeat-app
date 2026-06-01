import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores';
import { colors, spacing, typography } from '../../theme';
import { GAME_MODES } from '../../types/game';

export function ProfileScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { user, linkGoogle, linkApple } = useAuth();
  const profile = useUserStore();
  const { t } = useTranslation();
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);

  const isAnonymous = user?.isAnonymous ?? true;

  async function handleLink(provider: 'google' | 'apple') {
    setBusy(provider);
    try {
      if (provider === 'google') {
        await linkGoogle();
      } else {
        await linkApple();
      }
      Alert.alert(t('profile.linkSuccessTitle'), t('profile.linkSuccessBody'));
    } catch (e) {
      const message =
        (e as { message?: string }).message ?? t('profile.linkFailBody');
      Alert.alert(t('profile.linkFailTitle'), message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeLayout>
      <Header title={t('profile.title')} onBack={() => navigation.goBack()} />
      <View style={styles.identity}>
        <Avatar index={profile.avatar} size={72} />
        <Text style={styles.name}>{profile.displayName || t('profile.defaultName')}</Text>
        {profile.isPremium ? (
          <Text style={styles.premium}>{t('profile.premium')}</Text>
        ) : null}
      </View>

      <Card style={styles.block}>
        <Text style={styles.stat}>{t('profile.totalGames', { value: profile.totalGames })}</Text>
        <Text style={styles.stat}>{t('profile.totalXP', { value: profile.totalXP })}</Text>
        <Text style={styles.stat}>{t('profile.longestStreak', { value: profile.streak })}</Text>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>{t('profile.bestScores')}</Text>
        {GAME_MODES.map((m) => (
          <Text key={m} style={styles.stat}>
            {t(`modes.${m}.label`)}: {profile.bestScores[m]}
          </Text>
        ))}
      </Card>

      <View style={styles.spacer} />
      {isAnonymous ? (
        <>
          <Button
            label={busy === 'google' ? t('profile.linking') : t('profile.linkGoogle')}
            variant="secondary"
            disabled={busy !== null}
            onPress={() => handleLink('google')}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label={busy === 'apple' ? t('profile.linking') : t('profile.linkApple')}
              variant="secondary"
              disabled={busy !== null}
              onPress={() => handleLink('apple')}
            />
          ) : null}
        </>
      ) : (
        <Text style={styles.linked}>{t('profile.linked')}</Text>
      )}
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  name: { color: colors.textPrimary, fontSize: typography.heading2.fontSize, fontWeight: '700' },
  premium: { color: colors.orange500, fontWeight: '700' },
  block: { gap: spacing.sm, marginBottom: spacing.md },
  blockTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.body.fontSize },
  stat: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  spacer: { flex: 1 },
  linked: { color: colors.textSecondary, textAlign: 'center', fontSize: typography.body.fontSize },
});
