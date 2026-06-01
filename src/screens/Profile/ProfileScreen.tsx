import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar, AVATAR_COUNT, Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { updateUserDoc } from '../../services/firebase/firestore';
import { useUserStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';
import { GAME_MODES } from '../../types/game';

export function ProfileScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { user, linkGoogle, linkApple } = useAuth();
  const profile = useUserStore();
  const { t } = useTranslation();
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);
  const [nameDraft, setNameDraft] = useState(profile.displayName);
  const [savingName, setSavingName] = useState(false);

  const isAnonymous = user?.isAnonymous ?? true;
  const uid = user?.uid;

  async function saveDisplayName() {
    const trimmed = nameDraft.trim();
    if (!uid || !trimmed) {
      return;
    }
    setSavingName(true);
    try {
      await updateUserDoc(uid, { displayName: trimmed });
      useUserStore.getState().setUser({ displayName: trimmed });
    } catch {
      Alert.alert(t('profile.saveFailTitle'), t('profile.saveFailBody'));
    } finally {
      setSavingName(false);
    }
  }

  async function saveAvatar(index: number) {
    if (!uid) {
      return;
    }
    try {
      await updateUserDoc(uid, { avatar: index });
      useUserStore.getState().setUser({ avatar: index });
    } catch {
      Alert.alert(t('profile.saveFailTitle'), t('profile.saveFailBody'));
    }
  }

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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.identity}>
          <Avatar index={profile.avatar} size={72} />
          <Text style={styles.sectionLabel}>{t('profile.chooseAvatar')}</Text>
          <View style={styles.avatarRow}>
            {Array.from({ length: AVATAR_COUNT }, (_, i) => (
              <Pressable
                key={i}
                onPress={() => saveAvatar(i)}
                style={[styles.avatarChip, profile.avatar === i && styles.avatarChipActive]}
              >
                <Avatar index={i} size={44} />
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{t('profile.editName')}</Text>
          <TextInput
            style={styles.nameInput}
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder={t('profile.defaultName')}
            placeholderTextColor={colors.textMuted}
            maxLength={24}
          />
          <Button
            label={savingName ? t('profile.saving') : t('profile.saveName')}
            variant="secondary"
            disabled={savingName || !nameDraft.trim()}
            onPress={saveDisplayName}
          />
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
      </ScrollView>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl, gap: spacing.md },
  identity: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  avatarChip: {
    borderRadius: radius.full,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChipActive: { borderColor: colors.orange500 },
  nameInput: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bgBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  premium: { color: colors.orange500, fontWeight: '700' },
  block: { gap: spacing.sm },
  blockTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.body.fontSize },
  stat: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  linked: { color: colors.textSecondary, textAlign: 'center', fontSize: typography.body.fontSize },
});
