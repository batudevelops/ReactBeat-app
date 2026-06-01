import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '../../theme';

interface TimerBarProps {
  msLeft: number;
  timeLimit: number;
}

const LOW_RATIO = 0.3;

export function TimerBar({ msLeft, timeLimit }: TimerBarProps) {
  const ratio = Math.max(0, Math.min(1, msLeft / Math.max(1, timeLimit)));
  const low = ratio <= LOW_RATIO;
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (low) {
      pulse.value = withRepeat(
        withTiming(0.4, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 1;
    }
    return () => cancelAnimation(pulse);
  }, [low, pulse]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: low ? pulse.value : 1,
  }));

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          {
            width: `${ratio * 100}%`,
            backgroundColor: low ? colors.error : colors.orange500,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
