import { getLevelConfig } from '../levelConfig';
import { MIX_SUB_MODES, type MixSubMode } from '../../types/game';
import {
  generateColorConflictRound,
  type ColorConflictRound,
} from './colorConflict';
import {
  generateMemoryRound,
  isMemoryAnswerCorrect,
  type MemoryRound,
} from './memory';
import { generateOddOneOutRound, type OddOneOutRound } from './oddOneOut';
import { generatePatternRound, type PatternRound } from './pattern';
import { generateReflexRound, type ReflexRound } from './reflex';
import {
  generateMathSnapRound,
  type MathSnapRound,
} from './mathSnap';
import {
  generateDirectionRound,
  isDirectionAnswerCorrect,
  type CardinalDirection,
  type DirectionRound,
} from './direction';

export type MixRound =
  | { subMode: 'reflex'; round: ReflexRound }
  | { subMode: 'memory'; round: MemoryRound }
  | { subMode: 'pattern'; round: PatternRound }
  | { subMode: 'colorConflict'; round: ColorConflictRound }
  | { subMode: 'oddOneOut'; round: OddOneOutRound }
  | { subMode: 'mathSnap'; round: MathSnapRound }
  | { subMode: 'direction'; round: DirectionRound };

export type MixAnswer =
  | { subMode: 'reflex'; value: string }
  | { subMode: 'memory'; value: number[] }
  | { subMode: 'pattern'; value: string }
  | { subMode: 'colorConflict'; value: string }
  | { subMode: 'oddOneOut'; value: string }
  | { subMode: 'mathSnap'; value: string }
  | { subMode: 'direction'; value: CardinalDirection };

/** Pick a sub-mode, avoiding immediate repeat when possible. */
export function pickMixSubMode(previous?: MixSubMode): MixSubMode {
  const pool =
    previous && MIX_SUB_MODES.length > 1
      ? MIX_SUB_MODES.filter((m) => m !== previous)
      : MIX_SUB_MODES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Build one mixed round using the shared mix level for the chosen sub-mode. */
export function generateMixRound(level: number, previous?: MixSubMode): MixRound {
  const subMode = pickMixSubMode(previous);
  const cfg = getLevelConfig(subMode, level);

  switch (subMode) {
    case 'reflex':
      return { subMode, round: generateReflexRound(cfg) };
    case 'memory':
      return { subMode, round: generateMemoryRound(cfg, level) };
    case 'pattern':
      return { subMode, round: generatePatternRound(cfg, level) };
    case 'colorConflict':
      return { subMode, round: generateColorConflictRound(cfg) };
    case 'oddOneOut':
      return { subMode, round: generateOddOneOutRound(cfg, level) };
    case 'mathSnap':
      return { subMode, round: generateMathSnapRound(cfg, level) };
    case 'direction':
      return { subMode, round: generateDirectionRound(cfg, level) };
  }
}

export function isMixAnswerCorrect(
  round: MixRound,
  answer: MixAnswer | null,
): boolean {
  if (!answer || answer.subMode !== round.subMode) {
    return false;
  }

  switch (round.subMode) {
    case 'reflex':
      return answer.value === round.round.correctId;
    case 'memory':
      return (
        answer.subMode === 'memory' &&
        isMemoryAnswerCorrect(round.round, answer.value)
      );
    case 'pattern':
      return answer.value === round.round.correctId;
    case 'colorConflict':
      return answer.value === round.round.correctId;
    case 'oddOneOut':
      return answer.value === round.round.oddId;
    case 'mathSnap':
      return answer.value === round.round.correctId;
    case 'direction':
      return (
        answer.subMode === 'direction' &&
        isDirectionAnswerCorrect(round.round, answer.value)
      );
  }
}

/** Time limit for the active sub-round at the current mix level. */
export function getMixTimeLimit(round: MixRound, level: number): number {
  const cfg = getLevelConfig(round.subMode, level);

  switch (round.subMode) {
    case 'memory':
      return round.round.sequence.length * round.round.showDuration + 4000;
    case 'pattern':
      return cfg.timeLimit + round.round.showDuration;
    default:
      return cfg.timeLimit;
  }
}
