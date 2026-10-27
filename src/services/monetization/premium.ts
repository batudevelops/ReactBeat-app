import { trackEvent } from '../analytics';
import { useUserStore } from '../../stores/userStore';

/**
 * Reflects the live RevenueCat entitlement into the local store for instant UX.
 *
 * The authoritative `isPremium` flag in Firestore is written server-side by the
 * RevenueCat webhook (`functions/src/revenueCatWebhook.ts`) via the Admin SDK —
 * clients are blocked from writing it by Firestore rules, so we never touch the
 * user doc here. On each launch `useMonetization` re-reads the RevenueCat SDK
 * and calls this to keep the in-memory flag in sync.
 */
export function applyPremiumStatus(uid: string, isPremium: boolean): void {
  useUserStore.getState().setPremium(isPremium);
  if (isPremium) {
    trackEvent('purchase_completed');
  }
}
