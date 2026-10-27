import { getLevelConfig } from '../../engine/levelConfig';
import { calculateXP } from '../../engine/scorer';
import { submitValidatedScore } from '../../services/firebase/scores';
import { useGameStore } from '../../stores/gameStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUserStore } from '../../stores/userStore';
import type { GameMode } from '../../types/game';
import type { GameResult } from './types';

/**
 * Ends the current run: submits the session to the leaderboard, records
 * level/XP/best-score, and returns the {@link GameResult}.
 *
 * Reads everything from the global game store so it can be called both from the
 * game controller (natural game over) and from the back-navigation handler
 * (user leaves mid-run) — the latter is why leaving a game no longer silently
 * discards the score. `finalLevel` defaults to the store's current run level.
 */
export async function finalizeRun(
  mode: GameMode,
  finalLevel: number = useGameStore.getState().level,
): Promise<GameResult> {
  useProgressStore.getState().recordLevel(mode, finalLevel);

  const state = useGameStore.getState();
  const events = state.session?.events ?? [];
  const correct = events.filter((e) => e.correct).length;
  const wrong = events.length - correct;
  const avgReactionMs = correct
    ? Math.round(
        events
          .filter((e) => e.correct)
          .reduce((sum, e) => sum + e.reactionMs, 0) / correct,
      )
    : 0;

  const levelCfg = getLevelConfig(mode, finalLevel);
  const eventComboBonus = [...events]
    .reverse()
    .find((e) => e.correct && e.comboBonus != null)?.comboBonus;
  const comboBonus = eventComboBonus ?? levelCfg.comboBonus;

  let rank: number | undefined;
  let scoreSaved = false;
  let scoreSaveReasons: string[] | undefined;
  if (state.session) {
    const cf = await submitValidatedScore(
      state.session,
      state.score,
      comboBonus,
    );
    if (cf.valid) {
      scoreSaved = true;
      rank = cf.rank ?? undefined;
    } else if (state.score > 0) {
      scoreSaveReasons = cf.reasons?.length ? cf.reasons : ['rejected'];
    }
  } else if (state.score > 0) {
    scoreSaveReasons = ['no_session'];
  }

  const user = useUserStore.getState();
  const isNewRecord = state.score > (user.bestScores[mode] ?? 0);
  user.updateBestScore(mode, state.score);
  user.setUser({
    totalGames: user.totalGames + 1,
    totalXP: user.totalXP + calculateXP(state.score),
    lastPlayedAt: new Date().toISOString(),
  });

  return {
    score: state.score,
    isNewRecord,
    correct,
    wrong,
    avgReactionMs,
    finalLevel,
    rank,
    scoreSaved,
    scoreSaveReasons,
  };
}
