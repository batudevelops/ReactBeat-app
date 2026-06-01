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

export const MODE_META: Record<
  GameMode,
  { label: string; description: string; premium: boolean }
> = {
  reflex: {
    label: 'Reflex',
    description: 'Doğru seçeneğe en hızlı sen tap’la.',
    premium: false,
  },
  memory: {
    label: 'Memory',
    description: 'Gösterilen sırayı ezberle ve tekrarla.',
    premium: false,
  },
  pattern: {
    label: 'Pattern',
    description: 'Kısa süre görünen deseni bul.',
    premium: false,
  },
  colorConflict: {
    label: 'Color Conflict',
    description: 'Şeklin gerçek rengine tap’la.',
    premium: true,
  },
  oddOneOut: {
    label: 'Odd One Out',
    description: 'Farklı olanı yakala.',
    premium: true,
  },
};

export type Period = 'daily' | 'weekly' | 'alltime';

export function isPremiumMode(mode: GameMode): boolean {
  return PREMIUM_MODES.includes(mode);
}
