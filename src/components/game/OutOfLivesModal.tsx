import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { colors, spacing, typography } from '../../theme';

interface OutOfLivesModalProps {
  visible: boolean;
  loading?: boolean;
  showWatchAd?: boolean;
  onWatchAd: () => void;
  onEnd: () => void;
}

export function OutOfLivesModal({
  visible,
  loading = false,
  showWatchAd = true,
  onWatchAd,
  onEnd,
}: OutOfLivesModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} onClose={onEnd} dismissable={false} title={t('game.outOfLivesTitle')}>
      <Text style={styles.body}>
        {showWatchAd ? t('game.outOfLivesBody') : t('game.outOfLivesBodyNoContinue')}
      </Text>
      <View style={styles.actions}>
        {showWatchAd ? (
          <Button
            label={t('game.outOfLivesWatchAd')}
            variant="secondary"
            loading={loading}
            onPress={onWatchAd}
          />
        ) : null}
        <Button label={t('game.outOfLivesEnd')} variant="ghost" onPress={onEnd} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
