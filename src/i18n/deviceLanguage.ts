import { NativeModules, Platform } from 'react-native';

import type { AppLanguage } from './languages';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages';

/**
 * Best-effort device language using only core React Native bridges (no extra
 * native module, so it works without a rebuild). Falls back to English.
 */
export function getDeviceLanguage(): AppLanguage {
  let raw: string | undefined;
  try {
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings;
      raw = settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
    } else {
      raw = NativeModules.I18nManager?.localeIdentifier;
    }
  } catch {
    raw = undefined;
  }

  const code = (raw ?? '').slice(0, 2).toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as AppLanguage)
    : DEFAULT_LANGUAGE;
}
