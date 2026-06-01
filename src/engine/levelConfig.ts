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
const STREAK_THRESHOLD = 3; // §18 combo_threshold

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Reflex level table (§8). Level 31+ falls back to Remote Config defaults (§18). */
function reflexConfig(level: number): LevelConfig {
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
    timeLimit = 1000; // reflex_level_31_timeLimit
    options = 4; // reflex_level_31_options
    speedMultiplier = 1.8;
  }
  return {
    timeLimit,
    options,
    lives: DEFAULT_LIVES,
    speedMultiplier,
    comboBonus: 10,
    streakThreshold: STREAK_THRESHOLD,
  };
}

function memoryConfig(level: number): LevelConfig {
  // Grid grows 9 -> 16; reveal shrinks 800 -> 500ms.
  const gridSize = clamp(9 + Math.floor((level - 1) / 5), 9, 16);
  const showDuration = clamp(800 - (level - 1) * 10, 500, 800);
  return {
    timeLimit: 4000,
    options: gridSize,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.02, 1, 1.8),
    comboBonus: 12,
    streakThreshold: STREAK_THRESHOLD,
    gridSize,
    showDuration,
  };
}

function patternConfig(level: number): LevelConfig {
  // Reveal shrinks 1500 -> 400ms.
  const showDuration = clamp(1500 - (level - 1) * 40, 400, 1500);
  return {
    timeLimit: 3000,
    options: 4,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.02, 1, 1.8),
    comboBonus: 10,
    streakThreshold: STREAK_THRESHOLD,
    showDuration,
  };
}

function colorConflictConfig(level: number): LevelConfig {
  // Options grow 2 -> 6; time shrinks 2200 -> 900ms.
  const options = clamp(2 + Math.floor((level - 1) / 6), 2, 6);
  const timeLimit = clamp(2200 - (level - 1) * 40, 900, 2200);
  return {
    timeLimit,
    options,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.03, 1, 2),
    comboBonus: 14,
    streakThreshold: STREAK_THRESHOLD,
  };
}

function oddOneOutConfig(level: number): LevelConfig {
  // Grid grows 4 -> 9; time shrinks 2500 -> 1000ms.
  const gridSize = clamp(4 + Math.floor((level - 1) / 5), 4, 9);
  const timeLimit = clamp(2500 - (level - 1) * 45, 1000, 2500);
  return {
    timeLimit,
    options: gridSize,
    lives: DEFAULT_LIVES,
    speedMultiplier: clamp(1 + (level - 1) * 0.03, 1, 2),
    comboBonus: 14,
    streakThreshold: STREAK_THRESHOLD,
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
