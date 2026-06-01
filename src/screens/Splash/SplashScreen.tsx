import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SafeLayout } from '../../components/shared/SafeLayout';
import { colors, spacing, typography } from '../../theme';

export interface SplashScreenProps {
  onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  useEffect(() => {
    // TODO (Faz 3): anonim auth + remote/firestore config + kullanıcı yükle.
    const t = setTimeout(onReady, 1200);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <SafeLayout>
      <View style={styles.center}>
        <Text style={styles.logo}>BrainTap</Text>
        <Text style={styles.tagline}>REACT · REMEMBER · BEAT</Text>
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
});
