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

function interstitialUnitId(): string {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }
  const extra = admobExtra();
  return Platform.OS === 'ios'
    ? (extra.iosInterstitialId ?? TestIds.INTERSTITIAL)
    : (extra.androidInterstitialId ?? TestIds.INTERSTITIAL);
}

function rewardedUnitId(): string {
  if (__DEV__) {
    return TestIds.REWARDED;
  }
  const extra = admobExtra();
  return Platform.OS === 'ios'
    ? (extra.iosRewardedId ?? TestIds.REWARDED)
    : (extra.androidRewardedId ?? TestIds.REWARDED);
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

/** Shows a full-screen interstitial when loaded; resolves after close or skip. */
export function showInterstitialAd(): Promise<void> {
  return new Promise((resolve) => {
    const ad = getInterstitial();
    if (!interstitialLoaded) {
      ad.load();
      resolve();
      return;
    }
    const unsub = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsub();
      trackEvent('ad_interstitial_shown');
      resolve();
    });
    ad.show();
  });
}

/** Shows rewarded ad; resolves true when the user earns the reward. */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const ad = getRewarded();
    if (!rewardedLoaded) {
      ad.load();
      resolve(false);
      return;
    }
    let earned = false;
    const rewardUnsub = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
      },
    );
    const closeUnsub = ad.addAdEventListener(AdEventType.CLOSED, () => {
      rewardUnsub();
      closeUnsub();
      resolve(earned);
    });
    ad.show();
  });
}
