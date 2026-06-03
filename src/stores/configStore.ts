import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  fetchRemoteConfig,
  hydrateRemoteConfig,
} from '../services/firebase/remoteConfig';
import {
  DEFAULT_REMOTE_CONFIG,
  type RemoteConfigValues,
} from '../types/remoteConfig';

interface ConfigState {
  values: RemoteConfigValues;
  lastFetchedAt: number | null;

  fetchIfStale: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      values: { ...DEFAULT_REMOTE_CONFIG },
      lastFetchedAt: null,

      fetchIfStale: async () => {
        const { lastFetchedAt } = get();
        const stale =
          !lastFetchedAt || Date.now() - lastFetchedAt > 12 * 60 * 60 * 1000;
        if (!stale) {
          hydrateRemoteConfig(get().values, lastFetchedAt);
          return;
        }
        const values = await fetchRemoteConfig(true);
        set({ values, lastFetchedAt: Date.now() });
      },

      refresh: async () => {
        const values = await fetchRemoteConfig(true);
        set({ values, lastFetchedAt: Date.now() });
      },
    }),
    {
      name: 'reactbeat.config',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          hydrateRemoteConfig(state.values, state.lastFetchedAt);
        }
      },
    },
  ),
);
