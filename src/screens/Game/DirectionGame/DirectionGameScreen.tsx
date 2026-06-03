import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DirectionPromptPad } from '../../../components/game/DirectionPromptPad';
import { GameHud } from '../../../components/game';
import {
  generateDirectionRound,
  isDirectionAnswerCorrect,
  type CardinalDirection,
  type DirectionRound,
} from '../../../engine/modes';
import { formatLevelRules } from '../../../engine/levelSummary';
import { MODE_ACCENT } from '../../../types/game';
import type { GameModeScreenProps } from '../types';
import { useGameController } from '../useGameController';

export function DirectionGameScreen({ level, onFinish }: Readonly<GameModeScreenProps>) {
  const { t } = useTranslation();
  const { round, msLeft, timeLimit, score, combo, lives, maxLives, currentLevel, levelUpToken, submit } =
    useGameController<DirectionRound, CardinalDirection>({
      mode: 'direction',
      level,
      generate: (cfg, lvl) => generateDirectionRound(cfg, lvl),
      isCorrect: isDirectionAnswerCorrect,
      onFinish,
    });

  return (
    <View style={styles.container}>
      <GameHud
        score={score}
        combo={combo}
        lives={lives}
        maxLives={maxLives}
        msLeft={msLeft}
        timeLimit={timeLimit}
        level={currentLevel}
        levelRules={formatLevelRules('direction', currentLevel, t)}
        accentColor={MODE_ACCENT.direction}
        levelUpToken={levelUpToken}
      />

      {round ? (
        <View style={styles.play}>
          <DirectionPromptPad
            round={round}
            accentColor={MODE_ACCENT.direction}
            onSelect={(dir) => submit(dir)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  play: { flex: 1 },
});
