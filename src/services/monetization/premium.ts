import { trackEvent } from '../analytics';
import { updateUserDoc } from '../firebase/firestore';
import { useUserStore } from '../../stores/userStore';

/** Keeps Zustand + Firestore in sync after a purchase or restore. */
export async function applyPremiumStatus(
  uid: string,
  isPremium: boolean,
): Promise<void> {
  useUserStore.getState().setPremium(isPremium);
  await updateUserDoc(uid, { isPremium });
  if (isPremium) {
    trackEvent('purchase_completed');
  }
}
