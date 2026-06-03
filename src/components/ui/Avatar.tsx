import { StyleSheet, View, type ViewStyle } from 'react-native';

import { getAvatarDefinition, normalizeAvatarIndex } from '../../constants/avatars';
import { colors, radius } from '../../theme';
import { AvatarArt } from './avatarArt/AvatarArt';

export interface AvatarProps {
  /** Persisted avatar index (0–11). */
  index: number;
  size?: number;
  /** Highlight ring (profile picker, “you” on leaderboard). */
  selected?: boolean;
  style?: ViewStyle;
}

export function Avatar({ index, size = 56, selected = false, style }: AvatarProps) {
  const safeIndex = normalizeAvatarIndex(index);
  const def = getAvatarDefinition(safeIndex);
  const ring = selected ? def.accent : colors.bgBorder;

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ring,
          borderWidth: selected ? 3 : 1,
        },
        style,
      ]}
    >
      <AvatarArt index={safeIndex} size={size - (selected ? 6 : 2)} />
    </View>
  );
}

export { AVATAR_COUNT, AVATARS, getAvatarDefinition, normalizeAvatarIndex } from '../../constants/avatars';

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
  },
});
