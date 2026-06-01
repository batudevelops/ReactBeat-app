import { getDatabase } from 'firebase-admin/database';

import type { GameMode } from './types';

const PERIODS = ['daily', 'weekly', 'alltime'] as const;

export interface LeaderboardRow {
  score: number;
  name: string;
  avatar: number;
  ts: number;
}

/** Writes the score to daily/weekly/alltime if it beats the user's existing entry. */
export async function upsertLeaderboardScores(
  uid: string,
  mode: GameMode,
  row: LeaderboardRow,
): Promise<void> {
  const db = getDatabase();
  await Promise.all(
    PERIODS.map((period) =>
      db.ref(`leaderboard/${period}/${mode}/${uid}`).transaction((current: LeaderboardRow | null) => {
        const prev = current;
        if (!prev || row.score > prev.score) {
          return row;
        }
        return prev;
      }),
    ),
  );
}

/** 1-based weekly rank after write (top 100). */
export async function weeklyRank(
  uid: string,
  mode: GameMode,
): Promise<number | null> {
  const snap = await getDatabase().ref(`leaderboard/weekly/${mode}`).get();
  const data = snap.val() as Record<string, LeaderboardRow> | null;
  if (!data) {
    return null;
  }
  const sorted = Object.entries(data)
    .map(([id, row]) => ({ uid: id, score: row.score ?? 0, ts: row.ts ?? 0 }))
    .sort((a, b) => b.score - a.score || b.ts - a.ts)
    .slice(0, 100);
  const idx = sorted.findIndex((e) => e.uid === uid);
  return idx >= 0 ? idx + 1 : null;
}
