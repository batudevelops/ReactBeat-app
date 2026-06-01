/** Firestore `config/app` shape (§18 Remote Config defaults). */
export interface RemoteConfigValues {
  reflex_level_31_timeLimit: number;
  reflex_level_31_options: number;
  memory_level_31_gridSize: number;
  memory_level_31_showDuration: number;
  pattern_level_31_showDuration: number;
  interstitial_threshold: number;
  daily_leaderboard_size: number;
  combo_threshold: number;
  combo_multiplier_step: number;
}

export const DEFAULT_REMOTE_CONFIG: RemoteConfigValues = {
  reflex_level_31_timeLimit: 1000,
  reflex_level_31_options: 4,
  memory_level_31_gridSize: 16,
  memory_level_31_showDuration: 600,
  pattern_level_31_showDuration: 400,
  interstitial_threshold: 3,
  daily_leaderboard_size: 100,
  combo_threshold: 3,
  combo_multiplier_step: 0.1,
};
