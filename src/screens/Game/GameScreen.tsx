import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { Header } from '../../components/shared/Header';
import { SafeLayout } from '../../components/shared/SafeLayout';
import type { RootNavProp, RootStackParamList } from '../../app/navigation/types';
import { hasLivesToPlay, useGameStore, useUserStore } from '../../stores';
import type { GameMode } from '../../types/game';
import { finalizeRun } from './finalizeRun';
import type { GameResult } from './types';
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

  // Set when we navigate away programmatically (finish or confirmed quit) so the
  // `beforeRemove` guard lets that navigation through instead of re-prompting.
  const leavingRef = useRef(false);

  const goToResult = useCallback(
    (result: GameResult) => {
      leavingRef.current = true;
      navigation.replace('Result', {
        mode,
        score: result.score,
        isNewRecord: result.isNewRecord,
        correct: result.correct,
        wrong: result.wrong,
        avgReactionMs: result.avgReactionMs,
        level: result.finalLevel,
        rank: result.rank,
        scoreSaved: result.scoreSaved,
        scoreSaveReasons: result.scoreSaveReasons,
      });
    },
    [mode, navigation],
  );

  // Whether a back action should prompt (active run with points to lose).
  const hasUnsavedRun = useCallback(() => {
    const g = useGameStore.getState();
    return g.status === 'playing' && g.score > 0;
  }, []);

  const confirmAndLeave = useCallback(() => {
    if (!hasUnsavedRun()) {
      leavingRef.current = true;
      navigation.goBack();
      return;
    }
    const { score } = useGameStore.getState();
    Alert.alert(t('game.quitTitle'), t('game.quitBody', { score }), [
      { text: t('game.quitKeep'), style: 'cancel' },
      {
        text: t('game.quitConfirm'),
        style: 'destructive',
        onPress: () => {
          void finalizeRun(mode).then(goToResult);
        },
      },
    ]);
  }, [goToResult, hasUnsavedRun, mode, navigation, t]);

  useEffect(() => {
    if (!hasLivesToPlay(useUserStore.getState().isPremium)) {
      navigation.goBack();
    }
  }, [navigation]);

  // Intercept gesture / hardware back the same way as the header back button.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (leavingRef.current || !hasUnsavedRun()) {
        return;
      }
      e.preventDefault();
      confirmAndLeave();
    });
    return unsub;
  }, [navigation, confirmAndLeave, hasUnsavedRun]);

  useEffect(
    () => () => {
      useGameStore.getState().reset();
    },
    [],
  );

  const ModeComponent = MODE_SCREENS[mode];

  return (
    <SafeLayout>
      <Header title={t(`modes.${mode}.label`)} onBack={confirmAndLeave} />
      <ModeComponent level={level} onFinish={goToResult} />
      <GameOutOfLivesModal />
    </SafeLayout>
  );
}
