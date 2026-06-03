import * as Sentry from '@sentry/react-native';
import type { User } from 'firebase/auth';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  linkWithApple,
  linkWithGoogle,
  onAuthChange,
  signInAnonymously,
  signOut as authSignOut,
} from '../services/firebase/auth';
import {
  ensureUserDoc,
  getUserDoc,
  syncAuthProfileToFirestore,
} from '../services/firebase/firestore';
import { useMonetization } from './useMonetization';
import { useConfigStore } from '../stores/configStore';
import { useUserStore } from '../stores/userStore';
import type { UserDoc } from '../types/user';

/** Pushes a freshly loaded Firestore user doc into the persisted user store. */
function hydrateUserStore(uid: string, doc: UserDoc): void {
  useUserStore.getState().setUser({
    uid,
    displayName: doc.displayName,
    avatar: doc.avatar,
    isAnonymous: doc.isAnonymous,
    isPremium: doc.isPremium,
    bestScores: doc.bestScores,
    totalGames: doc.totalGames,
    totalXP: doc.totalXP,
    streak: doc.streak,
    lastPlayedAt: doc.lastPlayedAt?.toDate?.().toISOString() ?? null,
  });
}

type AuthStatus = 'loading' | 'ready';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  userDoc: UserDoc | null;
  /** Set when anonymous sign-in failed (e.g. provider disabled in console). */
  error: string | null;
  refreshUserDoc: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  linkApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useMonetization(user?.uid ?? null);

  useEffect(() => {
    mounted.current = true;
    void useConfigStore.getState().fetchIfStale();

    const unsub = onAuthChange(async (u) => {
      if (!mounted.current) {
        return;
      }
      setUser(u);
      if (u) {
        try {
          const doc = await ensureUserDoc(u.uid, { isAnonymous: u.isAnonymous });
          if (mounted.current) {
            setUserDoc(doc);
            hydrateUserStore(u.uid, doc);
          }
        } catch (e) {
          Sentry.captureException(e);
        }
        if (mounted.current) {
          setStatus('ready');
        }
      } else {
        setUserDoc(null);
      }
    });

    // Kick off lazy anonymous auth. If the Anonymous provider is disabled in the
    // Firebase console this rejects; we still let the app load (degraded) so the
    // UI is usable and the error is reported.
    signInAnonymously().catch((e: unknown) => {
      Sentry.captureException(e);
      if (mounted.current) {
        setError(
          'Anonim giriş başarısız. Firebase Console > Authentication > Anonymous etkin mi?',
        );
        setStatus('ready');
      }
    });

    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  const refreshUserDoc = useCallback(async () => {
    const current = user;
    if (!current) {
      return;
    }
    const doc = await getUserDoc(current.uid);
    if (mounted.current) {
      setUserDoc(doc);
    }
  }, [user]);

  const linkGoogle = useCallback(async () => {
    const linked = await linkWithGoogle();
    await syncAuthProfileToFirestore(linked);
    const doc = await getUserDoc(linked.uid);
    if (mounted.current && doc) {
      setUser(linked);
      setUserDoc(doc);
      hydrateUserStore(linked.uid, doc);
    }
  }, []);

  const linkApple = useCallback(async () => {
    const linked = await linkWithApple();
    await syncAuthProfileToFirestore(linked);
    const doc = await getUserDoc(linked.uid);
    if (mounted.current && doc) {
      setUser(linked);
      setUserDoc(doc);
      hydrateUserStore(linked.uid, doc);
    }
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      userDoc,
      error,
      refreshUserDoc,
      linkGoogle,
      linkApple,
      signOut,
    }),
    [status, user, userDoc, error, refreshUserDoc, linkGoogle, linkApple, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}
