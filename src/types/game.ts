export type GameMode =
  | 'reflex'
  | 'memory'
  | 'pattern'
  | 'colorConflict'
  | 'oddOneOut'
  | 'mathSnap'
  | 'direction'
  | 'mix';

/** Skill buckets for Home and Leaderboard navigation. */
export type SkillCategory = 'speed' | 'memory' | 'attention';

/** Modes rotated inside Brain Mix (excludes the mix container itself). */
export type MixSubMode = Exclude<GameMode, 'mix'>;

export const MIX_SUB_MODES: MixSubMode[] = [
  'reflex',
  'memory',
  'pattern',
  'colorConflict',
  'oddOneOut',
  'mathSnap',
  'direction',
];

export const GAME_MODES: GameMode[] = [
  'reflex',
  'memory',
  'pattern',
  'colorConflict',
  'oddOneOut',
  'mathSnap',
  'direction',
  'mix',
];

/** Modes that require premium (advanced attention games). */
export const PREMIUM_MODES: GameMode[] = ['colorConflict', 'oddOneOut'];

export interface SkillGroup {
  id: SkillCategory;
  labelKey: string;
  modes: GameMode[];
}

/** Free core + premium attention modes grouped for Home / Leaderboard. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'speed',
    labelKey: 'home.skills.speed',
    modes: ['reflex', 'mathSnap', 'direction'],
  },
  {
    id: 'memory',
    labelKey: 'home.skills.memory',
    modes: ['memory', 'pattern'],
  },
  {
    id: 'attention',
    labelKey: 'home.skills.attention',
    modes: ['colorConflict', 'oddOneOut'],
  },
];

export const QUICK_PLAY_MODE: GameMode = 'mix';

/** Leaderboard tabs: skill groups plus Brain Mix. */
export const LEADERBOARD_GROUPS: Array<
  SkillGroup | { id: 'mix'; labelKey: string; modes: GameMode[] }
> = [
  ...SKILL_GROUPS,
  { id: 'mix', labelKey: 'home.skills.mix', modes: ['mix'] },
];

export type LeaderboardGroupId = SkillCategory | 'mix';

/** Static per-mode metadata. User-facing label/description live in i18n
 * (`modes.<mode>.label` / `.description`). */
export const MODE_META: Record<GameMode, { premium: boolean; skill: SkillCategory | 'mix' }> = {
  reflex: { premium: false, skill: 'speed' },
  mathSnap: { premium: false, skill: 'speed' },
  direction: { premium: false, skill: 'speed' },
  memory: { premium: false, skill: 'memory' },
  pattern: { premium: false, skill: 'memory' },
  colorConflict: { premium: true, skill: 'attention' },
  oddOneOut: { premium: true, skill: 'attention' },
  mix: { premium: false, skill: 'mix' },
};

/** Per-mode accent for cards and HUD chips. */
export const MODE_ACCENT: Record<GameMode, string> = {
  reflex: '#3B82F6',
  memory: '#A855F7',
  pattern: '#14B8A6',
  colorConflict: '#DC2626',
  oddOneOut: '#EAB308',
  mathSnap: '#6366F1',
  direction: '#06B6D4',
  mix: '#F97316',
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

export function isModeLocked(mode: GameMode, isPremium: boolean): boolean {
  return MODE_META[mode].premium && !isPremium;
}
