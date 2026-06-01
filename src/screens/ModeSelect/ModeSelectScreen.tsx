import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { MODE_META } from '../../types/game';

export function ModeSelectScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ModeSelect'>>();
  const { mode } = route.params;
  const meta = MODE_META[mode];

  return (
    <SafeLayout>
      <Header title={meta.label} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.desc}>{meta.description}</Text>

        <Card style={styles.stats}>
          <Text style={styles.statLine}>Kişisel en iyi: —</Text>
          <Text style={styles.statLine}>Haftalık sıra: —</Text>
        </Card>

        <View style={styles.spacer} />

        <Button
          label="🎥 Reklam izle → +1 can"
          variant="secondary"
          onPress={() => {
            // TODO (Faz 10): AdMob rewarded.
          }}
        />
        <Button
          label="▶ Oyna"
          onPress={() => navigation.navigate('Game', { mode, level: 1 })}
        />
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  stats: {
    gap: spacing.sm,
  },
  statLine: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  spacer: {
    flex: 1,
  },
});
