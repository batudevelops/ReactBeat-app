import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { SafeLayout } from '../../components/shared/SafeLayout';
import { colors, spacing, typography } from '../../theme';

/**
 * Pure splash display. Readiness is driven by AuthProvider via RootNavigator
 * (anonymous auth + user doc load happen there).
 */
export function SplashScreen() {
  return (
    <SafeLayout>
      <View style={styles.center}>
        <Text style={styles.logo}>BrainTap</Text>
        <Text style={styles.tagline}>REACT · REMEMBER · BEAT</Text>
        <ActivityIndicator color={colors.orange500} style={styles.spinner} />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: {
    color: colors.orange500,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    letterSpacing: 2,
  },
  spinner: {
    marginTop: spacing.lg,
  },
});
