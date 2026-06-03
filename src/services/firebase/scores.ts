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

function callableErrorReason(error: unknown): string[] {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';

  if (code.includes('unauthenticated')) {
    return ['auth_required'];
  }
  if (code.includes('unavailable') || code.includes('deadline-exceeded')) {
    return ['network_error'];
  }
  if (code.includes('permission-denied') || code.includes('failed-precondition')) {
    return ['server_error'];
  }
  return ['network_error'];
}

/**
 * Sends the finished session to the Cloud Function for anti-cheat validation
 * and RTDB leaderboard write (Faz 8). Returns CF payload or structured failure.
 */
export async function submitValidatedScore(
  session: GameSession,
  claimedScore: number,
  comboBonus: number,
): Promise<ValidateScoreResponse> {
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
    return {
      valid: false,
      score: 0,
      rank: null,
      reasons: callableErrorReason(e),
    };
  }
}
