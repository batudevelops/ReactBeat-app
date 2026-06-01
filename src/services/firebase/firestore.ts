import {
  type DocumentReference,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { firestore } from '../../lib/firebase';
import { EMPTY_BEST_SCORES, type UserDoc } from '../../types/user';

function userRef(uid: string): DocumentReference {
  return doc(firestore, 'users', uid);
}

function randomDisplayName(): string {
  return `Oyuncu${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Reads `users/{uid}`; returns null when the document does not exist. */
export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

/** Creates a fresh `users/{uid}` document for a new (anonymous) user. */
export async function createUserDoc(
  uid: string,
  overrides: Partial<UserDoc> = {},
): Promise<void> {
  await setDoc(userRef(uid), {
    displayName: randomDisplayName(),
    avatar: Math.floor(Math.random() * 10),
    isAnonymous: true,
    isPremium: false,
    createdAt: serverTimestamp(),
    lastPlayedAt: serverTimestamp(),
    streak: 0,
    totalGames: 0,
    totalXP: 0,
    bestScores: { ...EMPTY_BEST_SCORES },
    ...overrides,
  });
}

/**
 * Returns the user doc, creating it first if it is missing. Used by the lazy
 * auth flow right after anonymous sign-in.
 */
export async function ensureUserDoc(
  uid: string,
  overrides: Partial<UserDoc> = {},
): Promise<UserDoc> {
  const existing = await getUserDoc(uid);
  if (existing) {
    return existing;
  }
  await createUserDoc(uid, overrides);
  const created = await getUserDoc(uid);
  if (!created) {
    throw new Error('Kullanıcı dokümanı oluşturulamadı.');
  }
  return created;
}

/** Shallow-merges fields into `users/{uid}`. */
export async function updateUserDoc(
  uid: string,
  data: Partial<UserDoc>,
): Promise<void> {
  await updateDoc(userRef(uid), data);
}
