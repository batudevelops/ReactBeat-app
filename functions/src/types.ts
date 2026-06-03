export type GameMode =
  | 'reflex'
  | 'memory'
  | 'pattern'
  | 'colorConflict'
  | 'oddOneOut'
  | 'mathSnap'
  | 'direction'
  | 'mix';

export interface TapEvent {
  ts: number;
  questionId: string;
  answer: string;
  correct: boolean;
  reactionMs: number;
  timeLimitMs?: number;
  comboBonus?: number;
}

export interface GameSession {
  sessionId: string;
  mode: GameMode;
  level: number;
  startTime: number;
  endTime: number;
  deviceFingerprint: string;
  events: TapEvent[];
}

export interface ValidateScoreRequest {
  session: GameSession;
  claimedScore: number;
  comboBonus?: number;
}

export interface ValidateScoreResponse {
  valid: boolean;
  score: number;
  rank: number | null;
  reasons?: string[];
}
