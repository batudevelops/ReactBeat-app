import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  type Auth,
  getAuth,
  // @ts-expect-error - getReactNativePersistence is exported from firebase/auth at runtime.
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = Constants.expoConfig?.extra?.firebase as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL: string;
};

if (!firebaseConfig?.apiKey) {
  throw new Error(
    'Firebase config missing. Check the "extra.firebase" block in app.config.js.',
  );
}

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// initializeAuth must run once; on Fast Refresh fall back to getAuth.
let auth: Auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(firebaseApp);
}

export const firebaseAuth = auth;
export const firestore = getFirestore(firebaseApp);
export const database = getDatabase(firebaseApp, firebaseConfig.databaseURL);
