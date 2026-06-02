import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { SafeLayout } from '../../components/shared/SafeLayout';
import { images } from '../../constants/assets';
import { colors, spacing } from '../../theme';

/**
 * In-app loading state while auth hydrates. Native splash (splash.png) stays
 * visible until RootNavigator hides it; this screen matches the same branding.
 */
export function SplashScreen() {
  return (
    <SafeLayout padded={false}>
      <View style={styles.center}>
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="BrainTap"
        />
        <ActivityIndicator color={colors.orange500} style={styles.spinner} />
      </View>
    </SafeLayout>
  );
}

const LOGO_ASPECT = 3116 / 872;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: '72%',
    maxWidth: 320,
    aspectRatio: LOGO_ASPECT,
  },
  spinner: {
    marginTop: spacing.lg,
  },
});
