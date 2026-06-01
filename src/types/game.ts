export type GameMode =
  | 'reflex'
  | 'memory'
  | 'pattern'
  | 'colorConflict'
  | 'oddOneOut';

export const GAME_MODES: GameMode[] = [
  'reflex',
  'memory',
  'pattern',
  'colorConflict',
  'oddOneOut',
];

export const PREMIUM_MODES: GameMode[] = ['colorConflict', 'oddOneOut'];

/** Static per-mode metadata. User-facing label/description live in i18n
 * (`modes.<mode>.label` / `.description`). */
export const MODE_META: Record<GameMode, { premium: boolean }> = {
  reflex: { premium: false },
  memory: { premium: false },
  pattern: { premium: false },
  colorConflict: { premium: true },
  oddOneOut: { premium: true },
};

/** i18n key helpers for a mode's label/description. */
export function modeLabelKey(mode: GameMode): string {
  return `modes.${mode}.label`;
}

export function modeDescriptionKey(mode: GameMode): string {
  return `modes.${mode}.description`;
}

export type Period = 'daily' | 'weekly' | 'alltime';

export function isPremiumMode(mode: GameMode): boolean {
  return PREMIUM_MODES.includes(mode);
}
