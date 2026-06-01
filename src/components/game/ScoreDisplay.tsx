import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../theme';

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <View>
      <Text style={styles.label}>Skor</Text>
      <Text style={styles.score}>{score.toLocaleString('tr-TR')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: typography.caption.fontSize },
  score: {
    color: colors.textPrimary,
    fontSize: typography.heading2.fontSize,
    fontWeight: '800',
  },
});
