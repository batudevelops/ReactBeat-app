import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';

export interface LoaderProps {
  label?: string;
}

export function Loader({ label }: LoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.orange500} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgBase,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
