import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useSettingsStore } from '../stores/settingsStore';
import { DEFAULT_LANGUAGE } from './languages';
import en from './locales/en.json';
import tr from './locales/tr.json';

// We don't use i18next plural forms, but its pluralResolver still warns about
// the missing Intl.PluralRules in Hermes. Drop only that noisy message.
const isPluralWarning = (args: unknown[]) =>
  typeof args[0] === 'string' && args[0].includes('pluralResolver');

const quietLogger = {
  type: 'logger' as const,
  log: (args: unknown[]) => console.log(...args),
  warn: (args: unknown[]) => {
    if (isPluralWarning(args)) {
      return;
    }
    console.warn(...args);
  },
  error: (args: unknown[]) => {
    if (isPluralWarning(args)) {
      return;
    }
    console.error(...args);
  },
};

void i18n.use(quietLogger).use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: useSettingsStore.getState().language,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

// Keep i18next in sync with the persisted language preference (manual switch
// in Settings + async rehydration of the stored value).
useSettingsStore.subscribe((state, prev) => {
  if (state.language !== prev.language && state.language !== i18n.language) {
    void i18n.changeLanguage(state.language);
  }
});

export { SUPPORTED_LANGUAGES, type AppLanguage } from './languages';
export default i18n;
