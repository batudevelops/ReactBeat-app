import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui';
import { colors, spacing, typography } from '../../../theme';
import type { GameModeScreenProps } from '../types';

export function ReflexGameScreen({ level, onFinish }: GameModeScreenProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Reflex</Text>
      <Text style={styles.level}>Level {level}</Text>
      <Text style={styles.note}>Oyun motoru Faz 5-6'da bağlanacak.</Text>
      <Button
        label="Bitir (test)"
        onPress={() => onFinish({ score: 4820, isNewRecord: true })}
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
