import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DIRECTION_PAD_ORDER,
  DIRECTION_SYMBOLS,
  type CardinalDirection,
  type DirectionRound,
} from '../../engine/modes';
import { colors, radius, spacing, typography } from '../../theme';

interface DirectionPromptPadProps {
  round: DirectionRound;
  accentColor: string;
  onSelect: (direction: CardinalDirection) => void;
  disabled?: boolean;
}

function usePromptText(round: DirectionRound): {
  text: string;
  large: boolean;
} {
  const { t } = useTranslation();
  const dir = t(`game.directions.${round.reference}`);

  switch (round.kind) {
    case 'directWord':
      return { text: dir, large: true };
    case 'directSymbol':
      return { text: DIRECTION_SYMBOLS[round.reference], large: true };
    case 'opposite':
      return { text: t('game.directionPrompt.opposite', { dir }), large: false };
    case 'clockwise':
      return { text: t('game.directionPrompt.clockwise', { dir }), large: false };
    case 'counterClockwise':
      return {
        text: t('game.directionPrompt.counterClockwise', { dir }),
        large: false,
      };
    case 'mirrorHorizontal':
      return {
        text: t('game.directionPrompt.mirrorHorizontal', { dir }),
        large: false,
      };
    case 'mirrorVertical':
      return {
        text: t('game.directionPrompt.mirrorVertical', { dir }),
        large: false,
      };
  }
}

export function DirectionPromptPad({
  round,
  accentColor,
  onSelect,
  disabled = false,
}: Readonly<DirectionPromptPadProps>) {
  const prompt = usePromptText(round);

  return (
    <View style={styles.wrap}>
      <Text
        style={prompt.large ? styles.symbolPrompt : styles.hint}
        numberOfLines={3}
      >
        {prompt.text}
      </Text>

      <View style={styles.pad}>
        {DIRECTION_PAD_ORDER.map((direction) => (
          <Pressable
            key={direction}
            disabled={disabled}
            style={({ pressed }) => [
              styles.padBtn,
              direction === 'up' && styles.padUp,
              direction === 'down' && styles.padDown,
              direction === 'left' && styles.padLeft,
              direction === 'right' && styles.padRight,
              { borderColor: `${accentColor}55` },
              pressed && !disabled && styles.padBtnPressed,
            ]}
            onPress={() => onSelect(direction)}
            accessibilityRole="button"
            accessibilityLabel={direction}
          >
            <Text style={styles.padSymbol}>{DIRECTION_SYMBOLS[direction]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const BTN = 76;
const GAP = spacing.sm;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  hint: {
    color: colors.textPrimary,
    fontSize: typography.heading2.fontSize,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  symbolPrompt: {
    color: colors.textPrimary,
    fontSize: 88,
    fontWeight: '800',
    lineHeight: 96,
    textAlign: 'center',
    minHeight: 96,
  },
  pad: {
    width: BTN * 2 + GAP * 3,
    height: BTN * 2 + GAP * 3,
    position: 'relative',
  },
  padBtn: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  padUp: {
    top: 0,
    left: BTN / 2 + GAP,
  },
  padDown: {
    bottom: 0,
    left: BTN / 2 + GAP,
  },
  padLeft: {
    top: BTN / 2 + GAP,
    left: 0,
  },
  padRight: {
    top: BTN / 2 + GAP,
    right: 0,
  },
  padSymbol: {
    color: colors.textPrimary,
    fontSize: typography.heading2.fontSize,
    fontWeight: '800',
  },
});
