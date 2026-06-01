import type { GameMode } from './game';

/** Single tap recorded during a game, used later for anti-cheat (§13). */
export interface TapEvent {
  ts: number;
  questionId: string;
  answer: string;
  correct: boolean;
  reactionMs: number;
}

/** Full play session captured client-side and validated by a Cloud Function (§13). */
export interface GameSession {
  sessionId: string;
  mode: GameMode;
  level: number;
  startTime: number;
  endTime: number;
  deviceFingerprint: string;
  events: TapEvent[];
}
