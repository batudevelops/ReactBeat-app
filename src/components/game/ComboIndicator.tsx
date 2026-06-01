import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, typography } from '../../theme';

interface ComboIndicatorProps {
  combo: number;
}

export function ComboIndicator({ combo }: ComboIndicatorProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (combo > 1) {
      scale.value = withSequence(
        withTiming(1.4, { duration: 120 }),
        withTiming(1, { duration: 120 }),
      );
    }
  }, [combo, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (combo < 2) {
    return null;
  }

  return (
    <Animated.View style={style}>
      <Text style={styles.combo}>x{combo}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  combo: {
    color: colors.amber400,
    fontSize: typography.heading3.fontSize,
    fontWeight: '800',
  },
});
