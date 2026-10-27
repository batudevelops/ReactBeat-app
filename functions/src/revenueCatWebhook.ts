import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

/**
 * Shared secret the RevenueCat dashboard sends in the `Authorization` header.
 * Set it with: `firebase functions:secrets:set REVENUECAT_WEBHOOK_AUTH`
 * and configure the same value under RevenueCat → Integrations → Webhooks.
 */
const REVENUECAT_WEBHOOK_AUTH = defineSecret('REVENUECAT_WEBHOOK_AUTH');

/** Must match the RevenueCat entitlement id and the client `ENTITLEMENT_ID`. */
const ENTITLEMENT_ID = 'premium';

/** Event types that mean the user currently owns the entitlement. */
const GRANT_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'SUBSCRIPTION_EXTENDED',
  'TRANSFER',
]);

/** Event types that mean the user lost the entitlement. */
const REVOKE_EVENTS = new Set(['EXPIRATION', 'REFUND']);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  entitlement_ids?: string[] | null;
  cancel_reason?: string | null;
  transferred_from?: string[] | null;
  transferred_to?: string[] | null;
}

async function setPremium(uid: string, isPremium: boolean): Promise<void> {
  if (!uid || uid.startsWith('$RCAnonymousID:')) {
    return;
  }
  await getFirestore()
    .doc(`users/${uid}`)
    .set({ isPremium }, { merge: true });
}

/**
 * RevenueCat webhook: the single source of truth for `users/{uid}.isPremium`.
 * Clients can no longer write that field (see firestore.rules); only this
 * function (Admin SDK) can, so a tampered client cannot fake premium.
 */
export const revenueCatWebhook = onRequest(
  { region: 'europe-west1', secrets: [REVENUECAT_WEBHOOK_AUTH] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const expected = REVENUECAT_WEBHOOK_AUTH.value();
    if (!expected || req.header('Authorization') !== expected) {
      logger.warn('revenueCatWebhook: rejected unauthorized request');
      res.status(401).send('Unauthorized');
      return;
    }

    const event = (req.body?.event ?? {}) as RevenueCatEvent;
    const type = event.type ?? 'UNKNOWN';
    const entitlements = event.entitlement_ids ?? [];

    // Only react to events that concern our entitlement (TRANSFER may omit it).
    if (
      type !== 'TRANSFER' &&
      entitlements.length > 0 &&
      !entitlements.includes(ENTITLEMENT_ID)
    ) {
      res.status(200).send('ignored');
      return;
    }

    try {
      if (type === 'TRANSFER') {
        await Promise.all([
          ...(event.transferred_from ?? []).map((uid) => setPremium(uid, false)),
          ...(event.transferred_to ?? []).map((uid) => setPremium(uid, true)),
        ]);
      } else if (GRANT_EVENTS.has(type) && event.app_user_id) {
        await setPremium(event.app_user_id, true);
      } else if (REVOKE_EVENTS.has(type) && event.app_user_id) {
        await setPremium(event.app_user_id, false);
      } else {
        logger.info('revenueCatWebhook: no-op event', { type });
      }
      res.status(200).send('ok');
    } catch (err) {
      logger.error('revenueCatWebhook: failed to apply event', { type, err });
      res.status(500).send('error');
    }
  },
);
