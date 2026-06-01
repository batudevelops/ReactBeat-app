import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export function Card({ children, elevated = false, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: elevated ? colors.bgElevated : colors.bgSurface },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
});
