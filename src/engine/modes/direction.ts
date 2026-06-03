import type { LevelConfig } from '../levelConfig';
import { pick, randomInt } from './util';

export type CardinalDirection = 'up' | 'down' | 'left' | 'right';

export type DirectionPromptKind =
  | 'directWord'
  | 'directSymbol'
  | 'opposite'
  | 'clockwise'
  | 'counterClockwise'
  | 'mirrorHorizontal'
  | 'mirrorVertical';

const ALL_DIRECTIONS: CardinalDirection[] = ['up', 'down', 'left', 'right'];

export const DIRECTION_SYMBOLS: Record<CardinalDirection, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const OPPOSITE: Record<CardinalDirection, CardinalDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const CLOCKWISE: Record<CardinalDirection, CardinalDirection> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

const COUNTER_CLOCKWISE: Record<CardinalDirection, CardinalDirection> = {
  up: 'left',
  left: 'down',
  down: 'right',
  right: 'up',
};

export interface DirectionRound {
  kind: DirectionPromptKind;
  reference: CardinalDirection;
  correctDirection: CardinalDirection;
}

function resolveDirection(
  kind: DirectionPromptKind,
  reference: CardinalDirection,
): CardinalDirection {
  switch (kind) {
    case 'directWord':
    case 'directSymbol':
      return reference;
    case 'opposite':
      return OPPOSITE[reference];
    case 'clockwise':
      return CLOCKWISE[reference];
    case 'counterClockwise':
      return COUNTER_CLOCKWISE[reference];
    case 'mirrorHorizontal':
      return reference === 'left' || reference === 'right'
        ? OPPOSITE[reference]
        : reference;
    case 'mirrorVertical':
      return reference === 'up' || reference === 'down'
        ? OPPOSITE[reference]
        : reference;
  }
}

function pickKind(level: number): DirectionPromptKind {
  if (level <= 5) {
    return 'directWord';
  }

  if (level <= 10) {
    return randomInt(10) < 3 ? 'directWord' : 'directSymbol';
  }

  if (level <= 17) {
    const roll = randomInt(100);
    if (roll < 50) {
      return 'opposite';
    }
    return roll < 75 ? 'directSymbol' : 'directWord';
  }

  if (level <= 24) {
    const roll = randomInt(100);
    if (roll < 28) {
      return 'opposite';
    }
    if (roll < 44) {
      return 'clockwise';
    }
    if (roll < 60) {
      return 'counterClockwise';
    }
    return roll < 80 ? 'directSymbol' : 'directWord';
  }

  const roll = randomInt(100);
  if (roll < 22) {
    return 'opposite';
  }
  if (roll < 36) {
    return 'clockwise';
  }
  if (roll < 50) {
    return 'counterClockwise';
  }
  if (roll < 62) {
    return 'mirrorHorizontal';
  }
  if (roll < 74) {
    return 'mirrorVertical';
  }
  return roll < 87 ? 'directSymbol' : 'directWord';
}

/** Text prompt + 4-way pad — rules escalate by level. */
export function generateDirectionRound(
  _config: LevelConfig,
  level: number,
): DirectionRound {
  let kind = pickKind(level);
  let reference = pick(ALL_DIRECTIONS);

  if (kind === 'mirrorHorizontal' && reference !== 'left' && reference !== 'right') {
    reference = pick(['left', 'right'] as CardinalDirection[]);
  }
  if (kind === 'mirrorVertical' && reference !== 'up' && reference !== 'down') {
    reference = pick(['up', 'down'] as CardinalDirection[]);
  }

  return {
    kind,
    reference,
    correctDirection: resolveDirection(kind, reference),
  };
}

export function isDirectionAnswerCorrect(
  round: DirectionRound,
  answer: CardinalDirection,
): boolean {
  return answer === round.correctDirection;
}

/** i18n key + params for the on-screen text prompt. */
export function getDirectionPromptParts(round: DirectionRound): {
  kind: DirectionPromptKind;
  reference: CardinalDirection;
  symbol: string;
} {
  return {
    kind: round.kind,
    reference: round.reference,
    symbol: DIRECTION_SYMBOLS[round.reference],
  };
}

export const DIRECTION_PAD_ORDER: CardinalDirection[] = [
  'up',
  'down',
  'left',
  'right',
];
