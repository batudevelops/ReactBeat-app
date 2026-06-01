export { colors } from './colors';
export type { ColorToken } from './colors';
export { typography } from './typography';
export type { TypographyVariant } from './typography';
export { spacing, radius } from './spacing';
export type { SpacingToken } from './spacing';

import { colors } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
} as const;

export type Theme = typeof theme;
