import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;

  toggleSound: () => void;
  toggleHaptic: () => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      notificationsEnabled: true,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
    }),
    {
      name: 'braintap.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
