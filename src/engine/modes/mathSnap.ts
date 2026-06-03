import type { TFunction } from 'i18next';

import type { LevelConfig } from '../levelConfig';
import { nextId, pick, randomInt, shuffle } from './util';

export type MathSnapKind =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'missingLeft'
  | 'missingRight'
  | 'double'
  | 'half'
  | 'chainAdd'
  | 'compare'
  | 'oddEven';

export interface MathSnapOption {
  id: string;
  label: string;
}

export interface MathSnapRound {
  kind: MathSnapKind;
  prompt: string;
  options: MathSnapOption[];
  correctId: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function operandMax(level: number): number {
  return clamp(5 + Math.floor(level / 3), 5, 20);
}

function multiplyMax(level: number): number {
  return clamp(3 + Math.floor(level / 8), 3, 9);
}

function buildNumericOptions(
  answer: number,
  count: number,
  min = 0,
): MathSnapOption[] {
  const values = new Set<number>([answer]);
  let attempts = 0;
  while (values.size < count && attempts < 60) {
    attempts += 1;
    const delta = randomInt(6) + 1;
    const candidate = answer + (randomInt(2) ? delta : -delta);
    if (candidate >= min) {
      values.add(candidate);
    }
  }
  let offset = 1;
  while (values.size < count) {
    const up = answer + offset;
    const down = answer - offset;
    if (up >= min) {
      values.add(up);
    }
    if (values.size < count && down >= min) {
      values.add(down);
    }
    offset += 1;
  }
  return shuffle([...values]).map((value) => ({
    id: nextId('math'),
    label: String(value),
  }));
}

function buildOddEvenOptions(isOdd: boolean): {
  options: MathSnapOption[];
  correctId: string;
} {
  const options: MathSnapOption[] = [
    { id: nextId('math'), label: 'odd' },
    { id: nextId('math'), label: 'even' },
  ];
  shuffle(options);
  const correctLabel = isOdd ? 'odd' : 'even';
  const correct = options.find((o) => o.label === correctLabel)!;
  return { options, correctId: correct.id };
}

function pickKind(level: number): MathSnapKind {
  if (level <= 5) {
    return 'add';
  }
  if (level <= 10) {
    return pick(['add', 'subtract'] as const);
  }
  if (level <= 14) {
    return pick(['add', 'subtract', 'missingLeft', 'missingRight'] as const);
  }
  if (level <= 18) {
    return pick([
      'add',
      'subtract',
      'multiply',
      'missingLeft',
      'missingRight',
      'compare',
    ] as const);
  }
  if (level <= 22) {
    return pick([
      'subtract',
      'multiply',
      'missingLeft',
      'missingRight',
      'double',
      'half',
      'compare',
    ] as const);
  }
  if (level <= 26) {
    return pick([
      'multiply',
      'missingLeft',
      'missingRight',
      'double',
      'half',
      'chainAdd',
      'oddEven',
      'compare',
    ] as const);
  }
  return pick([
    'multiply',
    'missingLeft',
    'missingRight',
    'double',
    'half',
    'chainAdd',
    'oddEven',
    'compare',
    'subtract',
  ] as const);
}

function buildRound(
  kind: MathSnapKind,
  level: number,
): Pick<MathSnapRound, 'prompt' | 'options' | 'correctId'> {
  const max = operandMax(level);

  switch (kind) {
    case 'add': {
      const a = randomInt(max) + 1;
      const b = randomInt(max) + 1;
      const answer = a + b;
      const options = buildNumericOptions(answer, 4);
      return {
        prompt: `${a} + ${b}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'subtract': {
      let a = randomInt(max) + 1;
      let b = randomInt(max) + 1;
      if (a <= b) {
        [a, b] = [b + 1, b];
      }
      const answer = a - b;
      const options = buildNumericOptions(answer, 4, 0);
      return {
        prompt: `${a} − ${b}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'multiply': {
      const m = multiplyMax(level);
      const a = randomInt(m) + 1;
      const b = randomInt(m) + 1;
      const answer = a * b;
      const options = buildNumericOptions(answer, 4, 0);
      return {
        prompt: `${a} × ${b}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'missingLeft': {
      const b = randomInt(max) + 1;
      const a = randomInt(max) + 1;
      const sum = a + b;
      const options = buildNumericOptions(a, 4, 0);
      return {
        prompt: `? + ${b} = ${sum}`,
        options,
        correctId: options.find((o) => Number(o.label) === a)!.id,
      };
    }
    case 'missingRight': {
      const a = randomInt(max) + 1;
      const b = randomInt(max) + 1;
      const sum = a + b;
      const options = buildNumericOptions(b, 4, 0);
      return {
        prompt: `${a} + ? = ${sum}`,
        options,
        correctId: options.find((o) => Number(o.label) === b)!.id,
      };
    }
    case 'double': {
      const n = randomInt(max) + 1;
      const answer = n * 2;
      const options = buildNumericOptions(answer, 4, 0);
      return {
        prompt: `2 × ${n}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'half': {
      const n = randomInt(max) + 1;
      const even = n * 2;
      const options = buildNumericOptions(n, 4, 0);
      return {
        prompt: `${even} ÷ 2`,
        options,
        correctId: options.find((o) => Number(o.label) === n)!.id,
      };
    }
    case 'chainAdd': {
      const a = randomInt(max) + 1;
      const b = randomInt(max) + 1;
      const c = randomInt(Math.min(max, 8)) + 1;
      const answer = a + b + c;
      const options = buildNumericOptions(answer, 4, 0);
      return {
        prompt: `${a} + ${b} + ${c}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'compare': {
      let a = randomInt(max) + 1;
      let b = randomInt(max) + 1;
      while (a === b) {
        b = randomInt(max) + 1;
      }
      const answer = Math.max(a, b);
      const values = new Set<number>([answer, Math.min(a, b)]);
      while (values.size < 4) {
        const delta = randomInt(5) + 1;
        values.add(answer + (randomInt(2) ? delta : -delta));
        if (values.size < 4) {
          values.add(Math.min(a, b) + (randomInt(2) ? delta : -delta));
        }
      }
      const options = shuffle([...values]).map((value) => ({
        id: nextId('math'),
        label: String(value),
      }));
      return {
        prompt: `${a}  ·  ${b}`,
        options,
        correctId: options.find((o) => Number(o.label) === answer)!.id,
      };
    }
    case 'oddEven': {
      const n = randomInt(max * 2) + 1;
      const isOdd = n % 2 === 1;
      const { options, correctId } = buildOddEvenOptions(isOdd);
      return { prompt: String(n), options, correctId };
    }
  }
}

export function formatMathSnapOptionLabel(
  option: MathSnapOption,
  kind: MathSnapKind,
  t: TFunction,
): string {
  if (kind === 'oddEven') {
    return t(`game.mathSnapOddEven.${option.label}`);
  }
  return option.label;
}

export function generateMathSnapRound(
  config: LevelConfig,
  level: number,
): MathSnapRound {
  const kind = pickKind(level);
  const round = buildRound(kind, level);
  const optionCount = Math.max(2, config.options);

  if (kind === 'oddEven') {
    return { kind, ...round };
  }

  const answer = Number(
    round.options.find((o) => o.id === round.correctId)!.label,
  );
  const options = buildNumericOptions(answer, optionCount, 0);
  const correct = options.find((o) => Number(o.label) === answer)!;

  return {
    kind,
    prompt: round.prompt,
    options,
    correctId: correct.id,
  };
}
