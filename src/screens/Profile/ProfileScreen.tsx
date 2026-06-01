import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { colors, spacing, typography } from '../../theme';
import { GAME_MODES, MODE_META } from '../../types/game';

export function ProfileScreen() {
  const navigation = useNavigation<RootNavProp>();

  return (
    <SafeLayout>
      <Header title="Profil" onBack={() => navigation.goBack()} />
      <View style={styles.identity}>
        <Avatar index={0} size={72} />
        <Text style={styles.name}>Oyuncu</Text>
      </View>

      <Card style={styles.block}>
        <Text style={styles.stat}>Toplam oyun: —</Text>
        <Text style={styles.stat}>Toplam XP: —</Text>
        <Text style={styles.stat}>En uzun seri: —</Text>
      </Card>

      <Card style={styles.block}>
        <Text style={styles.blockTitle}>En iyi skorlar</Text>
        {GAME_MODES.map((m) => (
          <Text key={m} style={styles.stat}>
            {MODE_META[m].label}: —
          </Text>
        ))}
      </Card>

      <View style={styles.spacer} />
      <Button label="Google ile bağla" variant="secondary" onPress={() => {}} />
      <Button label="Apple ile bağla" variant="secondary" onPress={() => {}} />
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  name: { color: colors.textPrimary, fontSize: typography.heading2.fontSize, fontWeight: '700' },
  block: { gap: spacing.sm, marginBottom: spacing.md },
  blockTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: typography.body.fontSize },
  stat: { color: colors.textSecondary, fontSize: typography.body.fontSize },
  spacer: { flex: 1 },
});
