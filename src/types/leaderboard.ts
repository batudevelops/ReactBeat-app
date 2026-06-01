/** Single row in a leaderboard list (§10 RTDB). */
export interface LeaderboardEntry {
  uid: string;
  score: number;
  name: string;
  avatar: number;
  ts: number;
}

export const LEADERBOARD_MAX_ENTRIES = 100;
