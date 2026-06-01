import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui';
import { colors, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';

export function OddOneOutScreen({ level, onFinish }: GameModeScreenProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Odd One Out</Text>
      <Text style={styles.level}>Level {level}</Text>
      <Text style={styles.note}>Premium · Oyun motoru Faz 5-6'da bağlanacak.</Text>
      <Button
        label="Bitir (test)"
        onPress={() => onFinish({ score: 0, isNewRecord: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { color: colors.textPrimary, fontSize: typography.heading1.fontSize, fontWeight: '800' },
  level: { color: colors.amber400, fontSize: typography.heading3.fontSize },
  note: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginBottom: spacing.lg },
});
