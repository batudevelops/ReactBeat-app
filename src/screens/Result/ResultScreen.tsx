import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { colors, spacing, typography } from '../../theme';
import { MODE_META } from '../../types/game';

export function ResultScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { mode, score, isNewRecord, rank, correct, wrong, avgReactionMs, level } =
    route.params;

  return (
    <SafeLayout>
      <View style={styles.body}>
        {isNewRecord ? <Badge label="🎉 YENİ REKOR!" tone="special" /> : null}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>{MODE_META[mode].label} skorun</Text>
          <Text style={styles.score}>{score.toLocaleString('tr-TR')}</Text>
        </View>

        <Card style={styles.stats}>
          <Text style={styles.statLine}>
            Doğru: {correct ?? '—'}  Yanlış: {wrong ?? '—'}
          </Text>
          <Text style={styles.statLine}>
            Ort. tepki: {avgReactionMs == null ? '—' : `${avgReactionMs} ms`}
          </Text>
          {rank == null ? null : (
            <Text style={styles.statLine}>Bu haftaki sıran: #{rank}</Text>
          )}
        </Card>

        <View style={styles.spacer} />

        <Button
          label="Tekrar Oyna"
          onPress={() => navigation.replace('Game', { mode, level: level ?? 1 })}
        />
        <Button
          label="Leaderboard'a bak"
          variant="secondary"
          onPress={() => navigation.navigate('Leaderboard', { mode })}
        />
        <Button
          label="Ana Menü"
          variant="ghost"
          onPress={() => navigation.popToTop()}
        />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.md, paddingTop: spacing.lg },
  scoreBox: { alignItems: 'center', gap: spacing.xs },
  scoreLabel: { color: colors.textMuted, fontSize: typography.body.fontSize },
  score: {
    color: colors.amber400,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
  },
  stats: { gap: spacing.sm },
  statLine: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  spacer: { flex: 1 },
});
