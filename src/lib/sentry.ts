import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

/**
 * Initializes Sentry crash reporting. No-ops when no DSN is configured,
 * so local/dev builds without a DSN run fine.
 */
export function initSentry(): void {
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1,
  });
}
