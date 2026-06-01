export interface GameResult {
  score: number;
  isNewRecord: boolean;
  correct: number;
  wrong: number;
  avgReactionMs: number;
}

export interface GameModeScreenProps {
  level: number;
  onFinish: (result: GameResult) => void;
}
