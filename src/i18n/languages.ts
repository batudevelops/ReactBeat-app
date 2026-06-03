export const SUPPORTED_LANGUAGES = [
  'tr',
  'en',
  'es',
  'de',
  'fr',
  'pt',
  'it',
  'ru',
  'ja',
  'ko',
  'ar',
  'zh',
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
