/**
 * Expo app configuration.
 *
 * Firebase is used via the JS SDK (the `firebase` package), so the native
 * GoogleService-Info.plist / google-services.json are NOT required here.
 * The web Firebase config below is public by design and is consumed at
 * runtime through expo-constants (Constants.expoConfig.extra.firebase).
 */

require('dotenv').config();

const APP_NAME = 'ReactBeat';
const SPLASH_BG = '#0c0a08';

// Google OAuth client IDs come from the Firebase iOS app's GoogleService-Info.plist
// (CLIENT_ID / REVERSED_CLIENT_ID) and the project web client (google-services.json,
// client_type 3). These are public values embedded in the app, so they are kept
// here directly; env vars can still override per build.
const googleWebClientId =
  process.env.GOOGLE_WEB_CLIENT_ID ||
  '909994962274-aibg719t8juamcjhb49dsagmuc5acdr1.apps.googleusercontent.com';
const googleIosClientId =
  process.env.GOOGLE_IOS_CLIENT_ID ||
  '909994962274-gkulbh9l7ulv4ffvb9tfc3nbsh14qpho.apps.googleusercontent.com';
// iOS URL scheme is the reversed iOS client ID.
const googleIosUrlScheme =
  process.env.GOOGLE_IOS_URL_SCHEME ||
  'com.googleusercontent.apps.909994962274-gkulbh9l7ulv4ffvb9tfc3nbsh14qpho';

// Google AdMob test app ids (replace via env for production).
const admobIosAppId =
  process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511';
const admobAndroidAppId =
  process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713';

const plugins = [
    [
      'expo-splash-screen',
      {
        backgroundColor: SPLASH_BG,
        image: './assets/splash.png',
        // iOS: cover + legacy full-screen storyboard constraints.
        resizeMode: 'cover',
        ios: {
          resizeMode: 'cover',
          enableFullScreenImage_legacy: true,
        },
        // Android: native drawable (splashscreen.xml + nodpi image), not 100dp centered icon.
        android: {
          resizeMode: 'native',
        },
        dark: {
          backgroundColor: SPLASH_BG,
          image: './assets/splash.png',
        },
      },
    ],
  'expo-audio',
  'expo-apple-authentication',
  [
    'react-native-google-mobile-ads',
    {
      androidAppId: admobAndroidAppId,
      iosAppId: admobIosAppId,
    },
  ],
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
    name: APP_NAME,
    slug: 'reactbeat',
    owner: 'fatih_2062',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'reactbeat',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: SPLASH_BG,
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.batudevelops.reactbeat',
      googleServicesFile: './GoogleService-Info.plist',
      usesAppleSignIn: true,
      infoPlist: {
        CFBundleDisplayName: APP_NAME,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.batudevelops.reactbeat',
      googleServicesFile: './google-services.json',
      label: APP_NAME,
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: SPLASH_BG,
      },
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
        appId: '1:909994962274:ios:ab7108decb16bccffa103b',
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
      appName: APP_NAME,
      eas: {
        projectId: '70a94134-3ffb-4666-84c1-5a5bc11eedea',
      },
      revenueCat: {
        iosApiKey: process.env.REVENUECAT_IOS_API_KEY || '',
        androidApiKey: process.env.REVENUECAT_ANDROID_API_KEY || '',
      },
      admob: {
        iosInterstitialId: process.env.ADMOB_IOS_INTERSTITIAL_ID || '',
        androidInterstitialId: process.env.ADMOB_ANDROID_INTERSTITIAL_ID || '',
        iosRewardedId: process.env.ADMOB_IOS_REWARDED_ID || '',
        androidRewardedId: process.env.ADMOB_ANDROID_REWARDED_ID || '',
      },
    },
  },
};
