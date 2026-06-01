import type { GameMode, Period } from '../../types/game';

export type RootStackParamList = {
  Home: undefined;
  ModeSelect: { mode: GameMode };
  Game: { mode: GameMode; level: number };
  Result: {
    score: number;
    mode: GameMode;
    isNewRecord: boolean;
    rank?: number;
  };
  Leaderboard: { mode?: GameMode };
  Profile: undefined;
  Settings: undefined;
  Paywall: undefined;
};

export type LeaderboardTab = { period: Period; mode: GameMode };
