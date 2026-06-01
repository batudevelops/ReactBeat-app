import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { spacing, typography } from '../../theme';

interface LivesBarProps {
  lives: number;
  max?: number;
}

export function LivesBar({ lives, max = 3 }: LivesBarProps) {
  const shake = useSharedValue(0);
  const prev = useRef(lives);

  useEffect(() => {
    if (lives < prev.current) {
      shake.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
    prev.current = lives;
  }, [lives, shake]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const hearts = Array.from({ length: max }, (_, i) => (i < lives ? '❤️' : '🤍'));

  return (
    <Animated.View style={[styles.row, style]}>
      <Text style={styles.hearts}>{hearts.join(' ')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  hearts: { fontSize: typography.body.fontSize },
});
