import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type PurchasesPackage,
} from 'react-native-purchases';

import { ENTITLEMENT_ID, PRODUCT_ID } from '../../constants/monetization';
import { useUserStore } from '../../stores/userStore';
import { trackEvent } from '../analytics';

function getApiKey(): string | null {
  const extra = Constants.expoConfig?.extra?.revenueCat as
    | { iosApiKey?: string; androidApiKey?: string }
    | undefined;
  const key =
    Platform.OS === 'ios' ? extra?.iosApiKey : extra?.androidApiKey;
  return key?.trim() ? key.trim() : null;
}

export function isRevenueCatConfigured(): boolean {
  return getApiKey() != null;
}

export async function configureRevenueCat(appUserId: string): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return;
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  await Purchases.configure({ apiKey, appUserID: appUserId });
}

export async function checkPremiumEntitlement(): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    return useUserStore.getState().isPremium;
  }
  const info = await Purchases.getCustomerInfo();
  return info.entitlements.active[ENTITLEMENT_ID] != null;
}

function pickLifetimePackage(
  packages: PurchasesPackage[],
): PurchasesPackage | undefined {
  return (
    packages.find((p) => p.product.identifier === PRODUCT_ID) ??
    packages.find((p) => p.packageType === 'LIFETIME') ??
    packages[0]
  );
}

/** Localized price from the current offering, or null if RC is not configured. */
export async function getPremiumPriceLabel(): Promise<string | null> {
  if (!isRevenueCatConfigured()) {
    return null;
  }
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const pkg = pickLifetimePackage(packages);
  return pkg?.product.priceString ?? null;
}

export async function purchasePremium(): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    throw new Error('RevenueCat API key is not configured.');
  }
  trackEvent('purchase_started');
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const pkg = pickLifetimePackage(packages);
  if (!pkg) {
    throw new Error('No purchasable package found in RevenueCat offerings.');
  }
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
}

export async function restorePurchases(): Promise<boolean> {
  if (!isRevenueCatConfigured()) {
    throw new Error('RevenueCat API key is not configured.');
  }
  const info = await Purchases.restorePurchases();
  const active = info.entitlements.active[ENTITLEMENT_ID] != null;
  if (active) {
    trackEvent('purchase_restored');
  }
  return active;
}
