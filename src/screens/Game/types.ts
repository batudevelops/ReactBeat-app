export interface GameResult {
  score: number;
  isNewRecord: boolean;
  correct: number;
  wrong: number;
  avgReactionMs: number;
  /** Highest level reached this run. */
  finalLevel: number;
  /** Weekly rank from Cloud Function after RTDB write (if deployed). */
  rank?: number;
  scoreSaved?: boolean;
  /** Machine reasons when scoreSaved is false (e.g. client_server_score_mismatch). */
  scoreSaveReasons?: string[];
}

export interface GameModeScreenProps {
  level: number;
  onFinish: (result: GameResult) => void;
}
