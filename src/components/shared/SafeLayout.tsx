import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../theme';

export interface SafeLayoutProps {
  children: ReactNode;
  edges?: Edge[];
  padded?: boolean;
  style?: ViewStyle;
}

export function SafeLayout({
  children,
  edges = ['top', 'bottom'],
  padded = true,
  style,
}: SafeLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[padded && styles.padded, styles.flex, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
