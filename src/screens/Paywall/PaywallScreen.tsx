import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { colors, spacing, typography } from '../../theme';

const PERKS = [
  '5 oyun moduna tam erişim',
  'Reklamsız deneyim',
  'Sınırsız can',
  'Tüm zamanlar leaderboard',
];

export function PaywallScreen() {
  const navigation = useNavigation<RootNavProp>();

  return (
    <SafeLayout>
      <View style={styles.body}>
        <Text style={styles.title}>BrainTap Premium</Text>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <Text key={p} style={styles.perk}>
              ✓ {p}
            </Text>
          ))}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>TEK SEFERLİK</Text>
          <Text style={styles.price}>$1.99</Text>
        </View>

        <View style={styles.spacer} />

        <Button
          label="Satın Al"
          onPress={() => {
            // TODO (Faz 10): RevenueCat purchasePackage.
          }}
        />
        <Button label="Restore Purchases" variant="secondary" onPress={() => {}} />
        <Button label="Kapat" variant="ghost" onPress={() => navigation.goBack()} />
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
  spacer: { flex: 1 },
});
