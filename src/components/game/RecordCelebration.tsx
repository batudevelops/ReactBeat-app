import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { spacing } from '../../theme';

/** Lightweight new-record celebration (Lottie asset deferred). */
export function RecordCelebration() {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 350 }),
        withTiming(1, { duration: 350 }),
      ),
      5,
      false,
    );
  }, [scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.emoji, style]}>🎉✨🎊</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emoji: { fontSize: 36 },
});
