import type { LevelConfig } from '../levelConfig';
import { GAME_COLORS, nextId, sampleDistinct, shuffle } from './util';

export interface ColorOption {
  id: string;
  hex: string;
}

export interface ColorConflictRound {
  /** The shape's TRUE color (the correct answer). */
  shapeColorHex: string;
  /** Conflicting background color, always different from the shape. */
  backgroundHex: string;
  options: ColorOption[];
  correctId: string;
}

export function generateColorConflictRound(
  config: LevelConfig,
): ColorConflictRound {
  const optionCount = Math.max(2, config.options);
  const palette = sampleDistinct(GAME_COLORS, optionCount + 1);
  const shape = palette[0];
  const background = palette[1]; // distinct from shape

  const optionColors = palette.slice(0, optionCount);
  if (!optionColors.some((c) => c.hex === shape.hex)) {
    optionColors[0] = shape;
  }
  const options = shuffle(
    optionColors.map((c) => ({ id: nextId('cc'), hex: c.hex })),
  );
  const correct = options.find((o) => o.hex === shape.hex)!;

  return {
    shapeColorHex: shape.hex,
    backgroundHex: background.hex,
    options,
    correctId: correct.id,
  };
}
