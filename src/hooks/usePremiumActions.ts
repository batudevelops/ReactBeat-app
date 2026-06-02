import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from './useAuth';
import {
  applyPremiumStatus,
  purchasePremium,
  restorePurchases,
} from '../services/monetization';

export function usePremiumActions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const purchase = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setFeedback(t('paywall.signInRequired'));
      return false;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const ok = await purchasePremium();
      if (ok) {
        await applyPremiumStatus(user.uid, true);
        setFeedback(t('paywall.purchaseSuccess'));
        return true;
      }
      setFeedback(t('paywall.purchaseFailed'));
      return false;
    } catch {
      setFeedback(t('paywall.purchaseFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  }, [t, user]);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setFeedback(t('paywall.signInRequired'));
      return false;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const ok = await restorePurchases();
      if (ok) {
        await applyPremiumStatus(user.uid, true);
        setFeedback(t('paywall.restoreSuccess'));
        return true;
      }
      setFeedback(t('paywall.restoreEmpty'));
      return false;
    } catch {
      setFeedback(t('paywall.restoreFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  }, [t, user]);

  return { purchase, restore, busy, feedback, clearFeedback: () => setFeedback(null) };
}
