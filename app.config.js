/**
 * Expo app configuration.
 *
 * Firebase is used via the JS SDK (the `firebase` package), so the native
 * GoogleService-Info.plist / google-services.json are NOT required here.
 * The web Firebase config below is public by design and is consumed at
 * runtime through expo-constants (Constants.expoConfig.extra.firebase).
 */

// Google OAuth client IDs come from the Firebase iOS app's GoogleService-Info.plist
// (CLIENT_ID / REVERSED_CLIENT_ID) and the project web client (google-services.json,
// client_type 3). These are public values embedded in the app, so they are kept
// here directly; env vars can still override per build.
const googleWebClientId =
  process.env.GOOGLE_WEB_CLIENT_ID ||
  '909994962274-aibg719t8juamcjhb49dsagmuc5acdr1.apps.googleusercontent.com';
const googleIosClientId =
  process.env.GOOGLE_IOS_CLIENT_ID ||
  '909994962274-9g993c0ma7tbhtdo6gjed1auv3hf5qsr.apps.googleusercontent.com';
// iOS URL scheme is the reversed iOS client ID.
const googleIosUrlScheme =
  process.env.GOOGLE_IOS_URL_SCHEME ||
  'com.googleusercontent.apps.909994962274-9g993c0ma7tbhtdo6gjed1auv3hf5qsr';

const plugins = [
  'expo-audio',
  'expo-apple-authentication',
  [
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: googleIosUrlScheme },
  ],
  [
    '@sentry/react-native/expo',
    {
      organization: 'batu-e1',
      project: 'braintap',
      url: 'https://de.sentry.io',
    },
  ],
];

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
      bundleIdentifier: 'com.batudevelops.braintap',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.batudevelops.braintap',
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
        appId: '1:909994962274:ios:018c42f0c33e4880fa103b',
        databaseURL:
          'https://braintap-b0486-default-rtdb.europe-west1.firebasedatabase.app',
      },
      // Google OAuth client IDs (public). webClientId is required by GoogleSignin
      // to obtain an idToken accepted by Firebase Auth; iosClientId is the iOS
      // OAuth client from GoogleService-Info.plist.
      google: {
        webClientId: googleWebClientId,
        iosClientId: googleIosClientId,
      },
      // Sentry DSN is public by design. Env var overrides the default if set.
      sentryDsn:
        process.env.SENTRY_DSN ||
        'https://fb0d7a668f3b0af296b1f144912e76f4@o4510990539948032.ingest.de.sentry.io/4511491185639504',
    },
  },
};
