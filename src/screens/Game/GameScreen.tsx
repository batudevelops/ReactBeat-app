import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import type { GameMode } from '../../types/game';
import { ColorConflictScreen } from './ColorConflictGame/ColorConflictScreen';
import { MemoryGameScreen } from './MemoryGame/MemoryGameScreen';
import { OddOneOutScreen } from './OddOneOutGame/OddOneOutScreen';
import { PatternGameScreen } from './PatternGame/PatternGameScreen';
import { ReflexGameScreen } from './ReflexGame/ReflexGameScreen';
import type { GameModeScreenProps } from './types';

const MODE_SCREENS: Record<GameMode, ComponentType<GameModeScreenProps>> = {
  reflex: ReflexGameScreen,
  memory: MemoryGameScreen,
  pattern: PatternGameScreen,
  colorConflict: ColorConflictScreen,
  oddOneOut: OddOneOutScreen,
};

export function GameScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { t } = useTranslation();
  const { mode, level } = route.params;

  const ModeComponent = MODE_SCREENS[mode];

  return (
    <SafeLayout>
      <Header title={t(`modes.${mode}.label`)} onBack={() => navigation.goBack()} />
      <ModeComponent
        level={level}
        onFinish={({ score, isNewRecord, correct, wrong, avgReactionMs, rank }) =>
          navigation.replace('Result', {
            mode,
            score,
            isNewRecord,
            correct,
            wrong,
            avgReactionMs,
            level,
            rank,
          })
        }
      />
    </SafeLayout>
  );
}
