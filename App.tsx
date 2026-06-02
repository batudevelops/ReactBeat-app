import {
  DarkTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/app/navigation/RootNavigator';
import { AuthProvider } from './src/hooks/useAuth';
import { colors } from './src/theme';
import './src/lib/firebase';
import './src/i18n';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  /* Dev reload can reject if splash is already hidden. */
});

const navTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bgBase,
    card: colors.bgSurface,
    border: colors.bgBorder,
    primary: colors.orange500,
    text: colors.textPrimary,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
