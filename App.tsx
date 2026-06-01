import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, Card } from './src/components/ui';
import { SafeLayout } from './src/components/shared/SafeLayout';
import { colors, spacing, typography } from './src/theme';
import { firebaseApp } from './src/lib/firebase';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeLayout>
        <View style={styles.content}>
          <Text style={styles.title}>BrainTap</Text>
          <Text style={styles.subtitle}>REACT · REMEMBER · BEAT</Text>

          <Card style={styles.card}>
            <Text style={styles.cardText}>
              Faz 1 hazır — tema, tipler ve UI bileşenleri kuruldu.
            </Text>
            <Text style={styles.muted}>
              Firebase: {firebaseApp.options.projectId}
            </Text>
          </Card>

          <Button label="Başla" onPress={() => {}} />
        </View>
      </SafeLayout>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.orange500,
    fontSize: typography.score.fontSize,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    letterSpacing: 2,
    textAlign: 'center',
  },
  card: {
    gap: spacing.sm,
  },
  cardText: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  muted: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
});
