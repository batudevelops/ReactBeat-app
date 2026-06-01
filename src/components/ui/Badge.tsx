import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';

export type BadgeTone = 'default' | 'success' | 'error' | 'info' | 'special';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const TONE_BG: Record<BadgeTone, string> = {
  default: colors.bgElevated,
  success: colors.success,
  error: colors.error,
  info: colors.info,
  special: colors.special,
};

export function Badge({ label, tone = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: TONE_BG[tone] }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
