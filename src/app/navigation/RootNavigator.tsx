import { useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';

import { useAuth } from '../../hooks/useAuth';
import { SplashScreen } from '../../screens/Splash/SplashScreen';
import { GameNavigator } from './GameNavigator';

export function RootNavigator() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') {
      ExpoSplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return <GameNavigator />;
}
