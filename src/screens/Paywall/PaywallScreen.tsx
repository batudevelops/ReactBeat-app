import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { usePremiumActions } from '../../hooks/usePremiumActions';
import { colors, spacing, typography } from '../../theme';

const PERK_KEYS = [
  'paywall.perkModes',
  'paywall.perkNoAds',
  'paywall.perkLives',
  'paywall.perkLeaderboard',
] as const;

export function PaywallScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { t } = useTranslation();
  const { purchase, restore, busy, feedback } = usePremiumActions();

  return (
    <SafeLayout>
      <View style={styles.body}>
        <Text style={styles.title}>{t('paywall.title')}</Text>

        <View style={styles.perks}>
          {PERK_KEYS.map((key) => (
            <Text key={key} style={styles.perk}>
              ✓ {t(key)}
            </Text>
          ))}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>{t('paywall.oneTime')}</Text>
          <Text style={styles.price}>$1.99</Text>
        </View>

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

        <View style={styles.spacer} />

        <Button
          label={t('paywall.buy')}
          loading={busy}
          onPress={() => {
            void purchase().then((ok) => {
              if (ok) {
                navigation.goBack();
              }
            });
          }}
        />
        <Button
          label={t('paywall.restore')}
          variant="secondary"
          loading={busy}
          onPress={() => void restore()}
        />
        <Button
          label={t('common.close')}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.md, paddingTop: spacing.lg },
  title: {
    color: colors.orange500,
    fontSize: typography.heading1.fontSize,
    fontWeight: '800',
    textAlign: 'center',
  },
  perks: { gap: spacing.sm, paddingVertical: spacing.md },
  perk: { color: colors.textPrimary, fontSize: typography.body.fontSize },
  priceBox: { alignItems: 'center', gap: spacing.xs },
  priceLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, letterSpacing: 2 },
  price: { color: colors.amber400, fontSize: typography.score.fontSize, fontWeight: '800' },
  feedback: {
    color: colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  spacer: { flex: 1 },
});
