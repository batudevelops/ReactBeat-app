import { useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import {
  findRank,
  provisionalRank,
  subscribeLeaderboard,
} from '../services/firebase/leaderboard';
import type { LeaderboardEntry } from '../types/leaderboard';
import type { GameMode, Period } from '../types/game';

interface UseLeaderboardOptions {
  /** When set, also compute rank for this score (e.g. just-finished game). */
  scoreHint?: number;
}

export function useLeaderboard(
  period: Period,
  mode: GameMode,
  options: UseLeaderboardOptions = {},
) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeLeaderboard(
      period,
      mode,
      (list) => {
        setEntries(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [period, mode]);

  const myRank = useMemo(() => {
    const uid = user?.uid;
    if (options.scoreHint != null && options.scoreHint > 0) {
      return provisionalRank(entries, uid, options.scoreHint);
    }
    return findRank(entries, uid);
  }, [entries, user?.uid, options.scoreHint]);

  const myEntry = useMemo(
    () => (user?.uid ? entries.find((e) => e.uid === user.uid) : undefined),
    [entries, user?.uid],
  );

  return { entries, myRank, myEntry, loading, error };
}
