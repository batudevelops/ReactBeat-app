import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

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

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

export type RootScreenProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
