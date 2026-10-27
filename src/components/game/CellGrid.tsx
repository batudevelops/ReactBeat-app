import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { radius as themeRadius } from '../../theme';

export interface CellGridProps {
  /** Number of tiles to render. */
  count: number;
  /** Tile edge length in px. */
  tileSize: number;
  /** Background color for a given tile index. */
  cellColor: (index: number) => string;
  /** Gap between tiles (px). */
  gap?: number;
  /** Corner radius of each tile. */
  tileRadius?: number;
  /** Fixed container width. */
  width?: number;
  /** Max container width (lets rows wrap, e.g. memory grid). */
  maxWidth?: number;
  /** When provided, tiles become Pressable and call this on tap. */
  onCellPress?: (index: number) => void;
  /** Disables interaction and taps (pointer events + a11y state). */
  disabled?: boolean;
}

/**
 * Shared wrapped grid of square tiles with per-cell coloring. Used by both the
 * Memory (interactive) and Pattern (static) modes so the layout + highlight
 * logic lives in one place.
 */
export function CellGrid({
  count,
  tileSize,
  cellColor,
  gap = 8,
  tileRadius = themeRadius.md,
  width,
  maxWidth,
  onCellPress,
  disabled = false,
}: Readonly<CellGridProps>) {
  const containerStyle: ViewStyle = { gap };
  if (width != null) {
    containerStyle.width = width;
  }
  if (maxWidth != null) {
    containerStyle.maxWidth = maxWidth;
  }

  return (
    <View
      style={[styles.grid, containerStyle]}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      {Array.from({ length: count }, (_, i) => {
        const tileStyle = {
          width: tileSize,
          height: tileSize,
          borderRadius: tileRadius,
          backgroundColor: cellColor(i),
        };
        if (!onCellPress) {
          return <View key={i} style={tileStyle} />;
        }
        return (
          <Pressable
            key={i}
            onPress={() => onCellPress(i)}
            style={tileStyle}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
