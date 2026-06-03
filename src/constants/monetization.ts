/** RevenueCat entitlement id (dashboard must match). */
export const ENTITLEMENT_ID = 'premium';

/** Store product id for the lifetime SKU. */
export const PRODUCT_ID = 'reactbeat_premium_lifetime';

/** Lives value used during a premium game session (never decremented). */
export const PREMIUM_LIVES = 999;

/** Free players start here and regen up to this cap. */
export const DEFAULT_LIVES = 8;

/** Extra lives granted after a rewarded ad (pool can exceed DEFAULT_LIVES by this much). */
export const BONUS_LIFE_FROM_AD = 1;

/** One life every 5 minutes. */
export const LIFE_REGEN_MS = 5 * 60 * 1000;
