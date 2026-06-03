import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

import { validateSession } from './antiCheat';
import { upsertLeaderboardScores, weeklyRank } from './leaderboardWrite';
import { scoreFromSession } from './scorer';
import type { GameMode, ValidateScoreRequest, ValidateScoreResponse } from './types';

const GAME_MODES: GameMode[] = [
  'reflex',
  'memory',
  'pattern',
  'colorConflict',
  'oddOneOut',
  'mix',
];

function isGameMode(value: string): value is GameMode {
  return (GAME_MODES as string[]).includes(value);
}

function assertSession(session: ValidateScoreRequest['session']): void {
  if (!session?.sessionId || !session.mode || !isGameMode(session.mode)) {
    throw new HttpsError('invalid-argument', 'Invalid session payload.');
  }
  if (!Array.isArray(session.events)) {
    throw new HttpsError('invalid-argument', 'Session events must be an array.');
  }
}

export const validateAndSaveScore = onCall(
  { region: 'europe-west1' },
  async (request: CallableRequest<ValidateScoreRequest>): Promise<ValidateScoreResponse> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Sign-in required.');
    }

    const data = request.data as ValidateScoreRequest;
    assertSession(data.session);

    const comboBonus = data.comboBonus ?? 10;
    const serverScore = scoreFromSession(data.session, comboBonus);
    const claimedScore = Math.max(0, Math.floor(data.claimedScore ?? 0));

    const validation = validateSession(data.session, claimedScore, comboBonus);
    if (!validation.valid) {
      return { valid: false, score: 0, rank: null, reasons: validation.reasons };
    }

    if (Math.abs(serverScore - claimedScore) > 5) {
      return {
        valid: false,
        score: 0,
        rank: null,
        reasons: ['client_server_score_mismatch'],
      };
    }

    const score = serverScore;
    if (score <= 0) {
      return { valid: true, score: 0, rank: null };
    }

    const userSnap = await getFirestore().doc(`users/${uid}`).get();
    const user = userSnap.data() ?? {};
    const name = (user.displayName as string) || 'Oyuncu';
    const avatar = (user.avatar as number) ?? 0;

    await upsertLeaderboardScores(uid, data.session.mode, {
      score,
      name,
      avatar,
      ts: Date.now(),
    });

    const rank = await weeklyRank(uid, data.session.mode);
    return { valid: true, score, rank };
  },
);
