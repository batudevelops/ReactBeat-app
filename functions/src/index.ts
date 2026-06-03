import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

import { resetDailyLeaderboard, resetWeeklyLeaderboard } from './resetLeaderboards';
import { validateAndSaveScore } from './validateAndSaveScore';

/** Must match app.config.js `extra.firebase.databaseURL` (europe-west1 RTDB). */
const RTDB_URL =
  'https://braintap-b0486-default-rtdb.europe-west1.firebasedatabase.app';

initializeApp({ databaseURL: RTDB_URL });
setGlobalOptions({ region: 'europe-west1' });

export { validateAndSaveScore, resetDailyLeaderboard, resetWeeklyLeaderboard };
