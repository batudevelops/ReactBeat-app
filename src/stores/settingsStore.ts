import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getDeviceLanguage } from '../i18n/deviceLanguage';
import type { AppLanguage } from '../i18n/languages';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  language: AppLanguage;

  toggleSound: () => void;
  toggleHaptic: () => void;
  toggleNotifications: () => void;
  setLanguage: (lang: AppLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      notificationsEnabled: true,
      language: getDeviceLanguage(),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'braintap.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
