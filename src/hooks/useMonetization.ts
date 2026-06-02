import * as Sentry from '@sentry/react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { useEffect, useRef } from 'react';

import {
  checkPremiumEntitlement,
  configureRevenueCat,
  preloadAds,
} from '../services/monetization';
import { applyPremiumStatus } from '../services/monetization/premium';
import { useUserStore } from '../stores/userStore';

/** Initializes AdMob + RevenueCat once auth uid is available. */
export function useMonetization(uid: string | null): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (!uid || initialized.current) {
      return;
    }
    initialized.current = true;

    void (async () => {
      try {
        await mobileAds().initialize();
        await preloadAds();
      } catch (e) {
        Sentry.captureException(e);
      }

      try {
        await configureRevenueCat(uid);
        const entitled = await checkPremiumEntitlement();
        const local = useUserStore.getState().isPremium;
        if (entitled !== local) {
          await applyPremiumStatus(uid, entitled);
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    })();
  }, [uid]);
}
