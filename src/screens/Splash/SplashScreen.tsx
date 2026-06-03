import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { SafeLayout } from '../../components/shared/SafeLayout';
import { images } from '../../constants/assets';
import { colors, spacing } from '../../theme';

/**
 * In-app loading state while auth hydrates. Native splash (splash.png) stays
 * visible until RootNavigator hides it; match the same full-bleed branding.
 */
export function SplashScreen() {
  return (
    <SafeLayout padded={false}>
      <View style={styles.root}>
        <Image
          source={images.splash}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <ActivityIndicator color={colors.orange500} style={styles.spinner} />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  spinner: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    alignSelf: 'center',
  },
});
