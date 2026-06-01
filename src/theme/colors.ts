export const colors = {
  // Primary — Brand Orange
  orange50: '#fff7ed',
  orange200: '#fed7aa',
  orange400: '#fb923c',
  orange500: '#f97316', // Primary CTA
  orange600: '#ea580c', // Pressed state
  orange700: '#c2410c',
  orange900: '#7c2d12', // Node fills

  // Secondary — Amber
  amber50: '#fffbeb',
  amber200: '#fde68a',
  amber400: '#fbbf24', // Stars, ödül
  amber500: '#f59e0b', // Skor parlaması
  amber600: '#d97706', // Bağlantı çizgileri
  amber800: '#92400e',

  // Feedback
  success: '#22c55e', // Doğru cevap
  error: '#ef4444', // Yanlış cevap
  info: '#3b82f6', // Leaderboard
  special: '#8b5cf6', // Streak rekoru

  // Backgrounds (dark theme)
  bgBase: '#0c0a08', // Ana arka plan
  bgSurface: '#1e1410', // Kartlar, modallar
  bgElevated: '#2a1f14', // Sheet, drawer
  bgBorder: '#3d2d1c', // Ayırıcılar

  // Text
  textPrimary: '#fafaf9', // Başlık, skor
  textSecondary: '#d6d3d1', // Gövde, etiket
  textMuted: '#78716c', // İpucu, altyazı
  textDisabled: '#44403c', // Pasif öğeler
} as const;

export type ColorToken = keyof typeof colors;
