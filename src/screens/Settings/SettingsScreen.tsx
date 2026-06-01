import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../../components/ui';
import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp } from '../../app/navigation/types';
import { useSettingsStore } from '../../stores';
import { colors, spacing, typography } from '../../theme';

function Row({
  label,
  value,
  onValueChange,
}: Readonly<{
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}>) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.orange500, false: colors.bgBorder }}
      />
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<RootNavProp>();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleHaptic = useSettingsStore((s) => s.toggleHaptic);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);

  return (
    <SafeLayout>
      <Header title="Ayarlar" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Row label="Ses efektleri" value={soundEnabled} onValueChange={toggleSound} />
        <Row label="Haptic feedback" value={hapticEnabled} onValueChange={toggleHaptic} />
        <Row
          label="Bildirimler"
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />

        <View style={styles.spacer} />

        <Button
          label="Premium satın al"
          onPress={() => navigation.navigate('Paywall')}
        />
        <Button label="Restore purchases" variant="ghost" onPress={() => {}} />
        <Text style={styles.version}>BrainTap v1.0.0</Text>
      </View>
    </SafeLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: colors.textPrimary, fontSize: typography.body.fontSize },
  spacer: { flex: 1 },
  version: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
});
