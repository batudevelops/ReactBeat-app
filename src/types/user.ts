import type { Timestamp } from 'firebase/firestore';

import type { GameMode } from './game';

export type BestScores = Record<GameMode, number>;

/**
 * Firestore `users/{uid}` document (ProjectDoc §10).
 * `createdAt` / `lastPlayedAt` are Firestore Timestamps on read and serverTimestamp
 * sentinels on write, so they are typed loosely here.
 */
export interface UserDoc {
  displayName: string;
  avatar: number; // built-in avatar index (see constants/avatars)
  isAnonymous: boolean;
  isPremium: boolean;
  createdAt: Timestamp | null;
  lastPlayedAt: Timestamp | null;
  streak: number;
  totalGames: number;
  totalXP: number;
  bestScores: BestScores;
}

export const EMPTY_BEST_SCORES: BestScores = {
  reflex: 0,
  memory: 0,
  pattern: 0,
  colorConflict: 0,
  oddOneOut: 0,
  mathSnap: 0,
  direction: 0,
  mix: 0,
};
