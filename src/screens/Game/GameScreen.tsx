import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { hasLivesToPlay, useGameStore, useUserStore } from '../../stores';
import type { GameMode } from '../../types/game';
import { ColorConflictScreen } from './ColorConflictGame/ColorConflictScreen';
import { DirectionGameScreen } from './DirectionGame/DirectionGameScreen';
import { MathSnapScreen } from './MathSnapGame/MathSnapScreen';
import { MemoryGameScreen } from './MemoryGame/MemoryGameScreen';
import { MixGameScreen } from './MixGame/MixGameScreen';
import { OddOneOutScreen } from './OddOneOutGame/OddOneOutScreen';
import { PatternGameScreen } from './PatternGame/PatternGameScreen';
import { ReflexGameScreen } from './ReflexGame/ReflexGameScreen';
import { GameOutOfLivesModal } from './GameOutOfLivesModal';
import type { GameModeScreenProps } from './types';

const MODE_SCREENS: Record<GameMode, ComponentType<GameModeScreenProps>> = {
  reflex: ReflexGameScreen,
  memory: MemoryGameScreen,
  pattern: PatternGameScreen,
  colorConflict: ColorConflictScreen,
  oddOneOut: OddOneOutScreen,
  mathSnap: MathSnapScreen,
  direction: DirectionGameScreen,
  mix: MixGameScreen,
};

export function GameScreen() {
  const navigation = useNavigation<RootNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { t } = useTranslation();
  const { mode, level } = route.params;

  useEffect(() => {
    if (!hasLivesToPlay(useUserStore.getState().isPremium)) {
      navigation.goBack();
    }
  }, [navigation]);

  useEffect(
    () => () => {
      useGameStore.getState().reset();
    },
    [],
  );

  const ModeComponent = MODE_SCREENS[mode];

  return (
    <SafeLayout>
      <Header title={t(`modes.${mode}.label`)} onBack={() => navigation.goBack()} />
      <ModeComponent
        level={level}
        onFinish={({
          score,
          isNewRecord,
          correct,
          wrong,
          avgReactionMs,
          rank,
          finalLevel,
          scoreSaved,
          scoreSaveReasons,
        }) =>
          navigation.replace('Result', {
            mode,
            score,
            isNewRecord,
            correct,
            wrong,
            avgReactionMs,
            level: finalLevel,
            rank,
            scoreSaved,
            scoreSaveReasons,
          })
        }
      />
      <GameOutOfLivesModal />
    </SafeLayout>
  );
}
