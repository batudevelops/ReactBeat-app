import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import {
  type User,
  type UserCredential,
  GoogleAuthProvider,
  OAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously as fbSignInAnonymously,
  signInWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth';

import { firebaseAuth } from '../../lib/firebase';

const googleConfig = Constants.expoConfig?.extra?.google as
  | { webClientId?: string; iosClientId?: string }
  | undefined;

/** User dismissed the Google/Apple account picker — not an error. */
export class AuthCancelledError extends Error {
  constructor() {
    super('AUTH_CANCELLED');
    this.name = 'AuthCancelledError';
  }
}

export function isAuthCancelledError(error: unknown): boolean {
  return error instanceof AuthCancelledError;
}

export function getCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, cb);
}

/** Ensures there is a signed-in user, creating an anonymous one if needed. */
export async function signInAnonymously(): Promise<User> {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }
  const { user } = await fbSignInAnonymously(firebaseAuth);
  return user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(firebaseAuth);
}

/**
 * Links a federated credential to the current (anonymous) user so progress is
 * preserved. If the credential already belongs to another account we fall back
 * to signing into that account.
 */
async function linkOrSignIn(
  credential: Parameters<typeof linkWithCredential>[1],
): Promise<User> {
  const current = firebaseAuth.currentUser;
  try {
    let result: UserCredential;
    if (current?.isAnonymous) {
      result = await linkWithCredential(current, credential);
    } else {
      result = await signInWithCredential(firebaseAuth, credential);
    }
    return result.user;
  } catch (error) {
    const code = (error as { code?: string }).code;
    // The provider account already exists -> sign in with it instead of merging.
    if (
      code === 'auth/credential-already-in-use' ||
      code === 'auth/email-already-in-use'
    ) {
      const result = await signInWithCredential(firebaseAuth, credential);
      return result.user;
    }
    throw error;
  }
}

// ---- Google ----------------------------------------------------------------

let googleConfigured = false;

async function getGoogleSignin() {
  // Lazy require keeps the bundle working even if the native module is absent.
  const mod = await import('@react-native-google-signin/google-signin');
  if (!googleConfigured) {
    if (!googleConfig?.webClientId) {
      throw new Error(
        'Google Sign-In yapılandırılmamış. app.config.js extra.google.webClientId (GOOGLE_WEB_CLIENT_ID) ayarlayın.',
      );
    }
    mod.GoogleSignin.configure({
      webClientId: googleConfig.webClientId,
      iosClientId: googleConfig.iosClientId || undefined,
    });
    googleConfigured = true;
  }
  return mod.GoogleSignin;
}

export async function linkWithGoogle(): Promise<User> {
  const mod = await import('@react-native-google-signin/google-signin');
  const GoogleSignin = await getGoogleSignin();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let idToken: string | null = null;
  try {
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      throw new AuthCancelledError();
    }
    idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }
  } catch (error) {
    if (isAuthCancelledError(error)) {
      throw error;
    }
    if ((error as { code?: string }).code === mod.statusCodes.SIGN_IN_CANCELLED) {
      throw new AuthCancelledError();
    }
    throw error;
  }

  if (!idToken) {
    throw new Error(
      'Google idToken alınamadı. Firebase Console > Project settings > Android uygulamasına debug SHA-1 ekleyip google-services.json dosyasını yeniden indirin.',
    );
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return linkOrSignIn(credential);
}

// ---- Apple -----------------------------------------------------------------

export async function isAppleAuthAvailable(): Promise<boolean> {
  return AppleAuthentication.isAvailableAsync();
}

export async function linkWithApple(): Promise<User> {
  // Firebase requires the raw nonce; Apple receives its SHA-256 hash.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!appleCredential.identityToken) {
    throw new Error('Apple girişinden identityToken alınamadı.');
  }

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: appleCredential.identityToken,
    rawNonce,
  });
  return linkOrSignIn(credential);
}
