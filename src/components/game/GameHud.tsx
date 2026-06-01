import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';
import { ComboIndicator } from './ComboIndicator';
import { LivesBar } from './LivesBar';
import { ScoreDisplay } from './ScoreDisplay';
import { TimerBar } from './TimerBar';

interface GameHudProps {
  score: number;
  combo: number;
  lives: number;
  maxLives?: number;
  msLeft: number;
  timeLimit: number;
}

export function GameHud({
  score,
  combo,
  lives,
  maxLives = 3,
  msLeft,
  timeLimit,
}: GameHudProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <ScoreDisplay score={score} />
        <ComboIndicator combo={combo} />
        <LivesBar lives={lives} max={maxLives} />
      </View>
      <TimerBar msLeft={msLeft} timeLimit={timeLimit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, paddingVertical: spacing.sm },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
