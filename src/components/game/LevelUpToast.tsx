import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '../../theme';

interface LevelUpToastProps {
  level: number;
  label: string;
  accentColor: string;
  /** Increments on each level-up to retrigger the animation. */
  token: number;
}

export function LevelUpToast({
  level,
  label,
  accentColor,
  token,
}: LevelUpToastProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (token <= 0) {
      return;
    }
    opacity.value = 0;
    scale.value = 0.6;
    translateY.value = 8;
    opacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 350 }),
    );
    scale.value = withSequence(
      withTiming(1.12, { duration: 220 }),
      withTiming(1, { duration: 180 }),
    );
    translateY.value = withSequence(
      withTiming(-6, { duration: 220 }),
      withTiming(-10, { duration: 900 }),
      withTiming(-16, { duration: 350 }),
    );
  }, [token, opacity, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  if (token <= 0) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { borderColor: accentColor, backgroundColor: `${accentColor}22` },
        style,
      ]}
    >
      <Text style={[styles.emoji]}>⬆️</Text>
      <Text style={[styles.text, { color: accentColor }]}>{label}</Text>
      <Text style={styles.levelNum}>Lv.{level}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: spacing.xs,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    shadowColor: colors.bgBase,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emoji: {
    fontSize: 16,
  },
  text: {
    fontSize: typography.body.fontSize,
    fontWeight: '800',
  },
  levelNum: {
    color: colors.textPrimary,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
});
