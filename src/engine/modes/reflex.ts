import type { LevelConfig } from '../levelConfig';
import { GAME_COLORS, nextId, sampleDistinct, shuffle } from './util';

export interface ReflexOption {
  id: string;
  label: string;
  hex: string;
}

export interface ReflexRound {
  /** Target color name the player must tap. */
  prompt: string;
  options: ReflexOption[];
  correctId: string;
}

export function generateReflexRound(config: LevelConfig): ReflexRound {
  const colors = sampleDistinct(GAME_COLORS, Math.max(2, config.options));
  const target = colors[0];
  const options = shuffle(
    colors.map((c) => ({ id: nextId('reflex'), label: c.name, hex: c.hex })),
  );
  const correct = options.find((o) => o.label === target.name)!;
  return {
    prompt: target.name,
    options,
    correctId: correct.id,
  };
}
