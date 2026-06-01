import { useAuth } from '../../hooks/useAuth';
import { SplashScreen } from '../../screens/Splash/SplashScreen';
import { GameNavigator } from './GameNavigator';

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return <GameNavigator />;
}
