import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { usePremiumActions } from '../../hooks/usePremiumActions';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import localeLabels from '../../i18n/localeLabels.json';
import { useSettingsStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';

function Row({
  label,
  value,
  onValueChange,
}: Readonly<{
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.orange500, false: colors.bgBorder }}
      />
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { t } = useTranslation();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const language = useSettingsStore((s) => s.language);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleHaptic = useSettingsStore((s) => s.toggleHaptic);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { restore, busy, feedback } = usePremiumActions();

  return (
    <SafeLayout>
      <Header title={t('settings.title')} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Row label={t('settings.sound')} value={soundEnabled} onValueChange={toggleSound} />
        <Row label={t('settings.haptic')} value={hapticEnabled} onValueChange={toggleHaptic} />
        <Row
          label={t('settings.notifications')}
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />

        <View style={styles.langSection}>
          <Text style={styles.rowLabel}>{t('settings.language')}</Text>
          <View style={styles.langGroup}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langChip, language === lang && styles.langChipActive]}
              >
                <Text
                  style={[
                    styles.langChipText,
                    language === lang && styles.langChipTextActive,
                  ]}
                >
                  {localeLabels[lang]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.linkRow}
          onPress={() => void Linking.openURL('https://batudevelops.com/privacy')}
        >
          <Text style={styles.linkText}>{t('settings.privacy')}</Text>
        </Pressable>
        <Pressable
          style={styles.linkRow}
          onPress={() => void Linking.openURL('https://batudevelops.com/terms')}
        >
          <Text style={styles.linkText}>{t('settings.terms')}</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Button
          label={t('settings.buyPremium')}
          onPress={() => navigation.navigate('Paywall')}
        />
        <Button label={t('settings.restore')} variant="ghost" loading={busy} onPress={() => void restore()} />
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        <Text style={styles.version}>{t('settings.version', { version: '1.0.0' })}</Text>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: colors.textPrimary, fontSize: typography.body.fontSize },
  langSection: { gap: spacing.sm, paddingVertical: spacing.sm },
  langGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  langChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
  },
  langChipActive: { backgroundColor: colors.orange500 },
  langChipText: { color: colors.textSecondary, fontSize: typography.caption.fontSize },
  langChipTextActive: { color: colors.textPrimary, fontWeight: '700' },
  linkRow: { paddingVertical: spacing.sm },
  linkText: {
    color: colors.info,
    fontSize: typography.body.fontSize,
    textDecorationLine: 'underline',
  },
  spacer: { flex: 1 },
  feedback: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  version: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
});
