/** Built-in avatar catalog. Index is persisted in Firestore / leaderboard RTDB. */
export interface AvatarDefinition {
  id: number;
  /** i18n key under `avatars.*` */
  nameKey: string;
  /** Ring / chip accent when selected */
  accent: string;
  /** Face background gradient [top, bottom] */
  gradient: [string, string];
}

export const AVATARS: AvatarDefinition[] = [
  { id: 0, nameKey: 'fox', accent: '#FB923C', gradient: ['#FDBA74', '#EA580C'] },
  { id: 1, nameKey: 'owl', accent: '#A855F7', gradient: ['#C4B5FD', '#7C3AED'] },
  { id: 2, nameKey: 'octopus', accent: '#14B8A6', gradient: ['#5EEAD4', '#0F766E'] },
  { id: 3, nameKey: 'lion', accent: '#FBBF24', gradient: ['#FDE68A', '#D97706'] },
  { id: 4, nameKey: 'panda', accent: '#E7E5E4', gradient: ['#FAFAF9', '#57534E'] },
  { id: 5, nameKey: 'robot', accent: '#3B82F6', gradient: ['#93C5FD', '#1D4ED8'] },
  { id: 6, nameKey: 'unicorn', accent: '#F472B6', gradient: ['#FBCFE8', '#DB2777'] },
  { id: 7, nameKey: 'bee', accent: '#FACC15', gradient: ['#FEF08A', '#CA8A04'] },
  { id: 8, nameKey: 'frog', accent: '#4ADE80', gradient: ['#86EFAC', '#15803D'] },
  { id: 9, nameKey: 'brain', accent: '#F97316', gradient: ['#FDBA74', '#C2410C'] },
  { id: 10, nameKey: 'cheetah', accent: '#FB7185', gradient: ['#FECDD3', '#E11D48'] },
  { id: 11, nameKey: 'cat', accent: '#818CF8', gradient: ['#C7D2FE', '#4338CA'] },
  { id: 12, nameKey: 'penguin', accent: '#38BDF8', gradient: ['#BAE6FD', '#0369A1'] },
  { id: 13, nameKey: 'dragon', accent: '#34D399', gradient: ['#6EE7B7', '#047857'] },
  { id: 14, nameKey: 'koala', accent: '#A8A29E', gradient: ['#E7E5E4', '#57534E'] },
  { id: 15, nameKey: 'shark', accent: '#64748B', gradient: ['#CBD5E1', '#334155'] },
  { id: 16, nameKey: 'monkey', accent: '#D97706', gradient: ['#FCD34D', '#92400E'] },
  { id: 17, nameKey: 'alien', accent: '#84CC16', gradient: ['#BEF264', '#3F6212'] },
  { id: 18, nameKey: 'ghost', accent: '#C4B5FD', gradient: ['#EDE9FE', '#6D28D9'] },
  { id: 19, nameKey: 'eagle', accent: '#78716C', gradient: ['#D6D3D1', '#44403C'] },
];

export const AVATAR_COUNT = AVATARS.length;

export function normalizeAvatarIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0;
  }
  const safe = Math.floor(index);
  return ((safe % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT;
}

export function getAvatarDefinition(index: number): AvatarDefinition {
  return AVATARS[normalizeAvatarIndex(index)];
}
