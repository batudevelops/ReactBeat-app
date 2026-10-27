import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import { trackEvent } from '../analytics';

type AdMobExtra = {
  iosInterstitialId?: string;
  androidInterstitialId?: string;
  iosRewardedId?: string;
  androidRewardedId?: string;
};

function admobExtra(): AdMobExtra {
  return (Constants.expoConfig?.extra?.admob as AdMobExtra | undefined) ?? {};
}

function configuredUnit(id: string | undefined, testId: string): string {
  const trimmed = id?.trim();
  return trimmed ? trimmed : testId;
}

function interstitialUnitId(): string {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }
  const extra = admobExtra();
  return Platform.OS === 'ios'
    ? configuredUnit(extra.iosInterstitialId, TestIds.INTERSTITIAL)
    : configuredUnit(extra.androidInterstitialId, TestIds.INTERSTITIAL);
}

function rewardedUnitId(): string {
  if (__DEV__) {
    return TestIds.REWARDED;
  }
  const extra = admobExtra();
  return Platform.OS === 'ios'
    ? configuredUnit(extra.iosRewardedId, TestIds.REWARDED)
    : configuredUnit(extra.androidRewardedId, TestIds.REWARDED);
}

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let rewarded: RewardedAd | null = null;
let rewardedLoaded = false;

function getInterstitial(): InterstitialAd {
  if (!interstitial) {
    interstitial = InterstitialAd.createForAdRequest(interstitialUnitId());
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      interstitial?.load();
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
    });
  }
  return interstitial;
}

function getRewarded(): RewardedAd {
  if (!rewarded) {
    rewarded = RewardedAd.createForAdRequest(rewardedUnitId());
    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
    });
    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      trackEvent('ad_rewarded_completed');
    });
    rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      rewardedLoaded = false;
      rewarded?.load();
    });
    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      rewardedLoaded = false;
    });
  }
  return rewarded;
}

export async function preloadAds(): Promise<void> {
  getInterstitial().load();
  getRewarded().load();
}

/** Max time to wait for an ad to finish loading before giving up. */
const REWARDED_WAIT_MS = 8000;
const INTERSTITIAL_WAIT_MS = 3000;

/**
 * Shows a full-screen interstitial. If it is still loading, waits briefly for
 * the load to finish; resolves after close, on error, or when the short wait
 * elapses (best-effort — never blocks the user for long).
 */
export function showInterstitialAd(): Promise<void> {
  return new Promise((resolve) => {
    const ad = getInterstitial();
    const subs: Array<() => void> = [];
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      subs.forEach((unsub) => unsub());
      resolve();
    };

    subs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        trackEvent('ad_interstitial_shown');
        finish();
      }),
    );
    subs.push(ad.addAdEventListener(AdEventType.ERROR, finish));

    const timer = setTimeout(finish, INTERSTITIAL_WAIT_MS);
    subs.push(() => clearTimeout(timer));

    if (interstitialLoaded) {
      ad.show();
    } else {
      subs.push(
        ad.addAdEventListener(AdEventType.LOADED, () => {
          if (!settled) {
            ad.show();
          }
        }),
      );
      ad.load();
    }
  });
}

/**
 * Shows a rewarded ad; resolves true only when the user earns the reward.
 * If the ad is not yet loaded, triggers a load and waits (up to a timeout)
 * so a tap does not silently no-op on slow networks.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const ad = getRewarded();
    const subs: Array<() => void> = [];
    let settled = false;
    let earned = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      subs.forEach((unsub) => unsub());
      resolve(value);
    };

    subs.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
    );
    subs.push(ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned)));
    subs.push(ad.addAdEventListener(AdEventType.ERROR, () => finish(false)));

    const timer = setTimeout(() => finish(false), REWARDED_WAIT_MS);
    subs.push(() => clearTimeout(timer));

    if (rewardedLoaded) {
      ad.show();
    } else {
      subs.push(
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          if (!settled) {
            ad.show();
          }
        }),
      );
      ad.load();
    }
  });
}
