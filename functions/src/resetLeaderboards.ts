import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getDatabase } from 'firebase-admin/database';

/** Every day at 00:00 UTC — clears `leaderboard/daily`. */
export const resetDailyLeaderboard = onSchedule(
  {
    schedule: '0 0 * * *',
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async () => {
    await getDatabase().ref('leaderboard/daily').remove();
  },
);

/** Every Monday at 00:00 UTC — clears `leaderboard/weekly`. */
export const resetWeeklyLeaderboard = onSchedule(
  {
    schedule: '0 0 * * 1',
    timeZone: 'UTC',
    region: 'europe-west1',
  },
  async () => {
    await getDatabase().ref('leaderboard/weekly').remove();
  },
);
