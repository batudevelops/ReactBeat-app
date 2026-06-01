import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../../theme';
import { GameScreen } from '../../screens/Game/GameScreen';
import { HomeScreen } from '../../screens/Home/HomeScreen';
import { LeaderboardScreen } from '../../screens/Leaderboard/LeaderboardScreen';
import { ModeSelectScreen } from '../../screens/ModeSelect/ModeSelectScreen';
import { PaywallScreen } from '../../screens/Paywall/PaywallScreen';
import { ProfileScreen } from '../../screens/Profile/ProfileScreen';
import { ResultScreen } from '../../screens/Result/ResultScreen';
import { SettingsScreen } from '../../screens/Settings/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function GameNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
