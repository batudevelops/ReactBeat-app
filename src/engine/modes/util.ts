/** Engine-local color palette (kept independent from the UI theme). */
export const GAME_COLORS: { name: string; hex: string }[] = [
  { name: 'Kırmızı', hex: '#EF4444' },
  { name: 'Turuncu', hex: '#F97316' },
  { name: 'Sarı', hex: '#EAB308' },
  { name: 'Yeşil', hex: '#22C55E' },
  { name: 'Mavi', hex: '#3B82F6' },
  { name: 'Mor', hex: '#A855F7' },
  { name: 'Pembe', hex: '#EC4899' },
  { name: 'Turkuaz', hex: '#14B8A6' },
];

export function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Returns `count` distinct items sampled from `arr` (count clamped to length). */
export function sampleDistinct<T>(arr: readonly T[], count: number): T[] {
  return shuffle(arr).slice(0, Math.min(count, arr.length));
}

let idCounter = 0;
export function nextId(prefix = 'opt'): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}
