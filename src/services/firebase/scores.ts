import * as Sentry from '@sentry/react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { finalizeSession } from '../../engine/antiCheat';
import { firebaseApp } from '../../lib/firebase';
import type { GameSession } from '../../types/session';

const functions = getFunctions(firebaseApp, 'europe-west1');

interface ValidateScoreRequest {
  session: GameSession;
  claimedScore: number;
  comboBonus?: number;
}

interface ValidateScoreResponse {
  valid: boolean;
  score: number;
  rank: number | null;
  reasons?: string[];
}

const validateAndSaveScoreFn = httpsCallable<
  ValidateScoreRequest,
  ValidateScoreResponse
>(functions, 'validateAndSaveScore');

/**
 * Sends the finished session to the Cloud Function for anti-cheat validation
 * and RTDB leaderboard write (Faz 8). Fails gracefully when offline or not deployed.
 */
export async function submitValidatedScore(
  session: GameSession,
  claimedScore: number,
  comboBonus: number,
): Promise<ValidateScoreResponse | null> {
  try {
    const finalized = finalizeSession(session);
    const { data } = await validateAndSaveScoreFn({
      session: finalized,
      claimedScore,
      comboBonus,
    });
    return data;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
}
