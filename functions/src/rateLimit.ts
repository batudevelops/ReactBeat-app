import { getDatabase } from 'firebase-admin/database';

/** Sliding window length for score-submit throttling. */
const WINDOW_MS = 60_000;
/** Max score submissions allowed per user within one window. */
const MAX_SUBMITS_PER_WINDOW = 30;

interface RateWindow {
  windowStart: number;
  count: number;
}

/**
 * Atomically records a score submission for `uid` and reports whether it is
 * within the allowed rate. Admin SDK writes bypass RTDB security rules, so the
 * `rateLimits` node stays private to the server.
 *
 * Returns `true` when the submission is allowed, `false` when the user has
 * exceeded {@link MAX_SUBMITS_PER_WINDOW} within {@link WINDOW_MS}.
 */
export async function allowScoreSubmit(uid: string): Promise<boolean> {
  const now = Date.now();
  const ref = getDatabase().ref(`rateLimits/scoreSubmit/${uid}`);

  const result = await ref.transaction((current: RateWindow | null) => {
    if (!current || now - current.windowStart >= WINDOW_MS) {
      return { windowStart: now, count: 1 };
    }
    return { windowStart: current.windowStart, count: current.count + 1 };
  });

  const value = result.snapshot.val() as RateWindow | null;
  if (!value) {
    // Transaction aborted (rare contention); fail open rather than block a
    // legitimate player.
    return true;
  }
  return value.count <= MAX_SUBMITS_PER_WINDOW;
}
