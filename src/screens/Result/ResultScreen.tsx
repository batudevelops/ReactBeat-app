import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card } from '../../components/ui';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { colors, spacing, typography } from '../../theme';

export function ResultScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { t, i18n } = useTranslation();
  const { mode, score, isNewRecord, rank, correct, wrong, avgReactionMs, level } =
    route.params;

  return (
    <SafeLayout>
      <View style={styles.body}>
        {isNewRecord ? <Badge label={t('result.newRecord')} tone="special" /> : null}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>
            {t('result.scoreLabel', { mode: t(`modes.${mode}.label`) })}
          </Text>
          <Text style={styles.score}>{score.toLocaleString(i18n.language)}</Text>
        </View>

        <Card style={styles.stats}>
          <Text style={styles.statLine}>
            {t('result.correctWrong', { correct: correct ?? '—', wrong: wrong ?? '—' })}
          </Text>
          <Text style={styles.statLine}>
            {avgReactionMs == null
              ? t('result.avgReactionEmpty')
              : t('result.avgReaction', { ms: avgReactionMs })}
          </Text>
          {rank == null ? null : (
            <Text style={styles.statLine}>{t('result.weeklyRank', { rank })}</Text>
          )}
        </Card>

        <View style={styles.spacer} />

        <Button
          label={t('result.playAgain')}
          onPress={() => navigation.replace('Game', { mode, level: level ?? 1 })}
        />
        <Button
          label={t('result.viewLeaderboard')}
          variant="secondary"
          onPress={() => navigation.navigate('Leaderboard', { mode })}
        />
        <Button
          label={t('result.mainMenu')}
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
