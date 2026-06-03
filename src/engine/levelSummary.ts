import type { TFunction } from 'i18next';

import { getLevelConfig } from './levelConfig';
import type { GameMode } from '../types/game';

/** Human-readable rules for a mode at a given level (HUD / ModeSelect). */
export function formatLevelRules(
  mode: GameMode,
  level: number,
  t: TFunction,
): string {
  const cfg = getLevelConfig(mode, level);

  switch (mode) {
    case 'reflex':
    case 'colorConflict':
      return t('levelRules.timeOptions', {
        time: (cfg.timeLimit / 1000).toFixed(1),
        count: cfg.options,
      });
    case 'mathSnap':
      if (level <= 5) {
        return t('levelRules.mathAdd', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 10) {
        return t('levelRules.mathSubtract', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 14) {
        return t('levelRules.mathMissing', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 18) {
        return t('levelRules.mathMultiply', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 22) {
        return t('levelRules.mathAdvanced', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 26) {
        return t('levelRules.mathExpert', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      return t('levelRules.mathMaster', {
        time: (cfg.timeLimit / 1000).toFixed(1),
      });
    case 'direction':
      if (level <= 5) {
        return t('levelRules.directionWords', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 10) {
        return t('levelRules.directionSymbols', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 17) {
        return t('levelRules.directionOpposite', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      if (level <= 24) {
        return t('levelRules.directionTurns', {
          time: (cfg.timeLimit / 1000).toFixed(1),
        });
      }
      return t('levelRules.directionAdvanced', {
        time: (cfg.timeLimit / 1000).toFixed(1),
      });
    case 'memory': {
      const seqLen = Math.max(3, Math.min(3 + Math.floor(level / 3), cfg.gridSize ?? 9));
      return t('levelRules.memory', {
        seq: seqLen,
        grid: cfg.gridSize ?? 9,
        show: ((cfg.showDuration ?? 700) / 1000).toFixed(1),
      });
    }
    case 'pattern':
      return t('levelRules.pattern', {
        time: (cfg.timeLimit / 1000).toFixed(1),
        show: ((cfg.showDuration ?? 1500) / 1000).toFixed(1),
        count: cfg.options,
      });
    case 'oddOneOut':
      return t('levelRules.oddOneOut', {
        time: (cfg.timeLimit / 1000).toFixed(1),
        grid: cfg.gridSize ?? 4,
      });
    case 'mix':
      return t('levelRules.mix', { level });
    default:
      return '';
  }
}
