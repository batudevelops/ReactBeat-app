import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';

export interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            hitSlop={8}
            onPress={onBack}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  side: {
    width: 48,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  back: {
    color: colors.textPrimary,
    fontSize: 34,
    lineHeight: 34,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: typography.heading3.fontSize,
    fontWeight: '700',
  },
});
