import type { TextStyle } from 'react-native';

export const typography = {
  heading1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  heading2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  heading3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  score: { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  combo: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
