import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../../theme';

/** Used when edge-to-edge Android reports 0 bottom inset. */
const ANDROID_BOTTOM_FALLBACK = 48;

function footerBottomPadding(insetsBottom: number): number {
  if (insetsBottom > 0) {
    return insetsBottom + spacing.sm;
  }
  if (Platform.OS === 'android') {
    return ANDROID_BOTTOM_FALLBACK + spacing.sm;
  }
  return spacing.md;
}

export interface BottomNavItem {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

interface BottomNavBarProps {
  items: BottomNavItem[];
}

export function BottomNavBar({ items }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: footerBottomPadding(insets.bottom) - spacing.sm },
      ]}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            item.active && styles.itemActive,
            pressed && styles.itemPressed,
          ]}
        >
          <Text style={[styles.icon, item.active && styles.iconActive]}>{item.icon}</Text>
          <Text style={[styles.label, item.active && styles.labelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Bottom padding for screens with floating action buttons above the home indicator. */
export function ScreenFooter({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: footerBottomPadding(insets.bottom) },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bgBorder,
    backgroundColor: colors.bgSurface,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    gap: 2,
  },
  itemActive: {
    backgroundColor: colors.bgElevated,
  },
  itemPressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 20,
  },
  iconActive: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.orange400,
  },
});
