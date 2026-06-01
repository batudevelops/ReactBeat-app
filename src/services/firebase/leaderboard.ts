import { onValue, ref, type Unsubscribe } from 'firebase/database';

import { database } from '../../lib/firebase';
import { getRemoteConfig } from './remoteConfig';
import type { LeaderboardEntry } from '../../types/leaderboard';
import type { GameMode, Period } from '../../types/game';

type RawRow = {
  score?: number;
  name?: string;
  avatar?: number;
  ts?: number;
};

/** Parses RTDB `leaderboard/{period}/{mode}` into a sorted top-N list. */
export function parseLeaderboardSnapshot(
  data: Record<string, RawRow> | null,
): LeaderboardEntry[] {
  if (!data) {
    return [];
  }
  const entries: LeaderboardEntry[] = Object.entries(data).map(([uid, row]) => ({
    uid,
    score: row.score ?? 0,
    name: row.name ?? '—',
    avatar: row.avatar ?? 0,
    ts: row.ts ?? 0,
  }));
  entries.sort((a, b) => b.score - a.score || b.ts - a.ts);
  const max = getRemoteConfig().daily_leaderboard_size;
  return entries.slice(0, max);
}

/** Realtime listener for one period + mode slice. */
export function subscribeLeaderboard(
  period: Period,
  mode: GameMode,
  onData: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const pathRef = ref(database, `leaderboard/${period}/${mode}`);
  return onValue(
    pathRef,
    (snap) => {
      onData(parseLeaderboardSnapshot(snap.val() as Record<string, RawRow> | null));
    },
    (err) => onError?.(err),
  );
}

/** 1-based rank for `uid`, or null when not on the board. */
export function findRank(
  entries: LeaderboardEntry[],
  uid: string | null | undefined,
): number | null {
  if (!uid) {
    return null;
  }
  const idx = entries.findIndex((e) => e.uid === uid);
  return idx >= 0 ? idx + 1 : null;
}

/**
 * Provisional rank after a fresh game when CF has not written yet: uses the
 * board plus the just-finished score if the user is not listed.
 */
export function provisionalRank(
  entries: LeaderboardEntry[],
  uid: string | null | undefined,
  score: number,
): number | null {
  const existing = findRank(entries, uid);
  if (existing != null) {
    return existing;
  }
  if (score <= 0) {
    return null;
  }
  const higher = entries.filter((e) => e.score > score).length;
  const rank = higher + 1;
  const max = getRemoteConfig().daily_leaderboard_size;
  return rank <= max ? rank : null;
}
