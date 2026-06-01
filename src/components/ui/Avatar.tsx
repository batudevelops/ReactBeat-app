import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../../theme';

const AVATAR_EMOJIS = [
  '🦊',
  '🐼',
  '🐯',
  '🦁',
  '🐸',
  '🐙',
  '🦉',
  '🐢',
  '🦄',
  '🐝',
];

export interface AvatarProps {
  /** 0-9 index */
  index: number;
  size?: number;
}

export function Avatar({ index, size = 56 }: AvatarProps) {
  const safeIndex = ((index % AVATAR_EMOJIS.length) + AVATAR_EMOJIS.length) %
    AVATAR_EMOJIS.length;

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius.full },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{AVATAR_EMOJIS[safeIndex]}</Text>
    </View>
  );
}

export const AVATAR_COUNT = AVATAR_EMOJIS.length;

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.bgBorder,
  },
});
