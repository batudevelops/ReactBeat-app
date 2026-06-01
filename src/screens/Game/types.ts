export interface GameResult {
  score: number;
  isNewRecord: boolean;
  correct: number;
  wrong: number;
  avgReactionMs: number;
  /** Weekly rank from Cloud Function after RTDB write (if deployed). */
  rank?: number;
  scoreSaved?: boolean;
}

export interface GameModeScreenProps {
  level: number;
  onFinish: (result: GameResult) => void;
}
