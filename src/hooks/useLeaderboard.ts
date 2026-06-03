import { useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import {
  findRank,
  provisionalRank,
  sliceLeaderboardTop,
  subscribeLeaderboard,
} from '../services/firebase/leaderboard';
import { getRemoteConfig } from '../services/firebase/remoteConfig';
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
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxVisible = getRemoteConfig().daily_leaderboard_size;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeLeaderboard(
      period,
      mode,
      (list) => {
        setAllEntries(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [period, mode]);

  const entries = useMemo(
    () => sliceLeaderboardTop(allEntries, maxVisible),
    [allEntries, maxVisible],
  );

  const myRank = useMemo(() => {
    const uid = user?.uid;
    if (options.scoreHint != null && options.scoreHint > 0) {
      return provisionalRank(allEntries, uid, options.scoreHint);
    }
    return findRank(allEntries, uid);
  }, [allEntries, user?.uid, options.scoreHint]);

  const myEntry = useMemo(
    () => (user?.uid ? allEntries.find((e) => e.uid === user.uid) : undefined),
    [allEntries, user?.uid],
  );

  return { entries, allEntries, myRank, myEntry, loading, error, maxVisible };
}
