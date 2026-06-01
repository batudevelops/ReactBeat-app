/**
 * Expo app configuration.
 *
 * Firebase is used via the JS SDK (the `firebase` package), so the native
 * GoogleService-Info.plist / google-services.json are NOT required here.
 * The web Firebase config below is public by design and is consumed at
 * runtime through expo-constants (Constants.expoConfig.extra.firebase).
 */

// Google Sign-In's iOS URL scheme is the REVERSED_CLIENT_ID of the iOS OAuth
// client (e.g. com.googleusercontent.apps.123-abc). It is only known after the
// Google OAuth iOS client is created in the Firebase/Google Cloud console, so
// the native config plugin is added conditionally to keep `prebuild` working
// before that external setup is done. Set GOOGLE_IOS_URL_SCHEME to enable it.
const googleIosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME || '';

const plugins = [
  'expo-audio',
  'expo-apple-authentication',
  [
    '@sentry/react-native/expo',
    {
      organization: 'batu-e1',
      project: 'braintap',
      url: 'https://de.sentry.io',
    },
  ],
];

if (googleIosUrlScheme) {
  plugins.push([
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: googleIosUrlScheme },
  ]);
}

module.exports = {
  expo: {
    name: 'BrainTap',
    slug: 'braintap',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'braintap',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.braintap.app',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.braintap.app',
    },
    // Sentry org/project live in the EU region (url => https://de.sentry.io).
    // Source map upload at build time needs SENTRY_AUTH_TOKEN in the environment.
    plugins,
    extra: {
      firebase: {
        apiKey: 'AIzaSyCwFFgQSygpMTYWFOmeixs-RSPjxCIUUoE',
        authDomain: 'braintap-b0486.firebaseapp.com',
        projectId: 'braintap-b0486',
        storageBucket: 'braintap-b0486.firebasestorage.app',
        messagingSenderId: '909994962274',
        appId: '1:909994962274:ios:56488de04bd4455ffa103b',
      },
      // Google OAuth client IDs (from Firebase console -> Auth -> Google).
      // webClientId is required by GoogleSignin to obtain an idToken usable by
      // Firebase Auth; iosClientId is the iOS OAuth client. Filled via env until
      // the external Google setup is done.
      google: {
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
        iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || '',
      },
      // Sentry DSN is public by design. Env var overrides the default if set.
      sentryDsn:
        process.env.SENTRY_DSN ||
        'https://fb0d7a668f3b0af296b1f144912e76f4@o4510990539948032.ingest.de.sentry.io/4511491185639504',
    },
  },
};
