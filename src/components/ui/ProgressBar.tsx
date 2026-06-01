import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';

export interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = colors.orange500,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bgBorder,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
