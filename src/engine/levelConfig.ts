import { getRemoteConfig } from '../services/firebase/remoteConfig';
import type { GameMode } from '../types/game';

export interface LevelConfig {
  timeLimit: number; // ms per question
  options: number; // number of answer options
  lives: number;
  speedMultiplier: number; // animation speed
  comboBonus: number; // flat extra points per combo step
  streakThreshold: number; // consecutive correct needed to start combo
  gridSize?: number; // Memory / OddOneOut grid (cell count)
  showDuration?: number; // Memory / Pattern reveal duration (ms)
}

const DEFAULT_LIVES = 3;
const HIGH_LEVEL = 31;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rc() {
  return getRemoteConfig();
}

/** Reflex level table (§8). Level 31+ uses Firestore `config/app` (§18). */
function reflexConfig(level: number): LevelConfig {
  const remote = rc();
  let timeLimit: number;
  let options: number;
  let speedMultiplier: number;
  if (level <= 5) {
    timeLimit = 2000;
    options = 2;
    speedMultiplier = 1;
  } else if (level <= 15) {
    timeLimit = 1500;
    options = 3;
    speedMultiplier = 1.2;
  } else if (level <= 30) {
    timeLimit = 1200;
    options = 4;
    speedMultiplier = 1.5;
  } else {
    timeLimit = remote.reflex_level_31_timeLimit;
    options = remote.reflex_level_31_options;
    speedMultiplier = 1.8;
  }
  return {
    timeLimit,
    options,
    lives: DEFAULT_LIVES,
    speedMultiplier,
    comboBonus: 10,
    streakThreshold: remote.combo_threshold,
  };
}

function memoryConfig(level: number): LevelConfig {
  const remote = rc();
  const capGrid = level >= HIGH_LEVEL ? remote.memory_level_31_gridSize : 16;
  const floorShow =
    level >= HIGH_LEVEL ? remote.memory_level_31_showDuration : 500;
  const gridSize = clamp(9 + Math.floor((level - 1) / 5), 9, capGrid);
  const showDuration = clamp(800 - (level - 1) * 10, floorShow, 800);
  return {
    timeLimit: 4000,
    options: gridSize,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.02, 1, 1.8),
    comboBonus: 12,
    streakThreshold: remote.combo_threshold,
    gridSize,
    showDuration,
  };
}

function patternConfig(level: number): LevelConfig {
  const remote = rc();
  const floorShow =
    level >= HIGH_LEVEL ? remote.pattern_level_31_showDuration : 400;
  const showDuration = clamp(1500 - (level - 1) * 40, floorShow, 1500);
  return {
    timeLimit: 3000,
    options: 4,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.02, 1, 1.8),
    comboBonus: 10,
    streakThreshold: remote.combo_threshold,
    showDuration,
  };
}

function colorConflictConfig(level: number): LevelConfig {
  const remote = rc();
  const options = clamp(2 + Math.floor((level - 1) / 6), 2, 6);
  const timeLimit = clamp(2200 - (level - 1) * 40, 900, 2200);
  return {
    timeLimit,
    options,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.03, 1, 2),
    comboBonus: 14,
    streakThreshold: remote.combo_threshold,
  };
}

function oddOneOutConfig(level: number): LevelConfig {
  const remote = rc();
  const gridSize = clamp(4 + Math.floor((level - 1) / 5), 4, 9);
  const timeLimit = clamp(2500 - (level - 1) * 45, 1000, 2500);
  return {
    timeLimit,
    options: gridSize,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.03, 1, 2),
    comboBonus: 14,
    streakThreshold: remote.combo_threshold,
    gridSize,
  };
}

const BUILDERS: Record<GameMode, (level: number) => LevelConfig> = {
  reflex: reflexConfig,
  memory: memoryConfig,
  pattern: patternConfig,
  colorConflict: colorConflictConfig,
  oddOneOut: oddOneOutConfig,
};

export function getLevelConfig(mode: GameMode, level: number): LevelConfig {
  const safeLevel = Math.max(1, Math.floor(level));
  return BUILDERS[mode](safeLevel);
}
