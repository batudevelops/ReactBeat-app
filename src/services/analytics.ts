export type AnalyticsEvent =
  | 'game_started'
  | 'game_finished'
  | 'new_record'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_restored'
  | 'ad_interstitial_shown'
  | 'ad_rewarded_completed';

type AnalyticsProps = Record<string, string | number | boolean>;

/** Thin analytics facade; wire PostHog/Firebase Analytics here later (Faz 11). */
export function trackEvent(name: AnalyticsEvent, props?: AnalyticsProps): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, props ?? {});
  }
}
