import { useState } from 'react';

import { SplashScreen } from '../../screens/Splash/SplashScreen';
import { GameNavigator } from './GameNavigator';

export function RootNavigator() {
  // TODO (Faz 3): Splash gerçek auth/config yüklemesini yapınca ready olacak.
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <SplashScreen onReady={() => setReady(true)} />;
  }

  return <GameNavigator />;
}
