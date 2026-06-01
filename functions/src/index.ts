import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

import { resetDailyLeaderboard, resetWeeklyLeaderboard } from './resetLeaderboards';
import { validateAndSaveScore } from './validateAndSaveScore';

initializeApp();
setGlobalOptions({ region: 'europe-west1' });

export { validateAndSaveScore, resetDailyLeaderboard, resetWeeklyLeaderboard };
