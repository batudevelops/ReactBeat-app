import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useUserStore } from '../../stores';
import { colors, spacing, typography } from '../../theme';
import { GAME_MODES, MODE_META } from '../../types/game';

export function ProfileScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { user, linkGoogle, linkApple } = useAuth();
  const profile = useUserStore();
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
      Alert.alert('Başarılı', 'Hesabın bağlandı, ilerlemen artık güvende.');
    } catch (e) {
      const message =
        (e as { message?: string }).message ?? 'Bağlama sırasında hata oluştu.';
      Alert.alert('Bağlanamadı', message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeLayout>
      <Header title="Profil" onBack={() => navigation.goBack()} />
      <View style={styles.identity}>
        <Avatar index={profile.avatar} size={72} />
        <Text style={styles.name}>{profile.displayName || 'Oyuncu'}</Text>
        {profile.isPremium ? <Text style={styles.premium}>★ Premium</Text> : null}
      </View>

      <Card style={styles.block}>
        <Text style={styles.stat}>Toplam oyun: {profile.totalGames}</Text>
        <Text style={styles.stat}>Toplam XP: {profile.totalXP}</Text>
        <Text style={styles.stat}>En uzun seri: {profile.streak}</Text>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>En iyi skorlar</Text>
        {GAME_MODES.map((m) => (
          <Text key={m} style={styles.stat}>
            {MODE_META[m].label}: {profile.bestScores[m]}
          </Text>
        ))}
      </Card>

      <View style={styles.spacer} />
      {isAnonymous ? (
        <>
          <Button
            label={busy === 'google' ? 'Bağlanıyor…' : 'Google ile bağla'}
            variant="secondary"
            disabled={busy !== null}
            onPress={() => handleLink('google')}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label={busy === 'apple' ? 'Bağlanıyor…' : 'Apple ile bağla'}
              variant="secondary"
              disabled={busy !== null}
              onPress={() => handleLink('apple')}
            />
          ) : null}
        </>
      ) : (
        <Text style={styles.linked}>Hesabın bağlı ✓</Text>
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
