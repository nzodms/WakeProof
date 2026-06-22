import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuth } from '@/features/auth/AuthProvider';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '@/screens/system/SplashScreen';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { CreateAlarmScreen } from '@/screens/alarm/CreateAlarmScreen';
import { ActiveAlarmScreen } from '@/screens/alarm/ActiveAlarmScreen';
import { MissionSetupScreen } from '@/screens/missions/MissionSetupScreen';
import { MissionExecutionScreen } from '@/screens/missions/MissionExecutionScreen';
import { WakeCheckScreen } from '@/screens/wake/WakeCheckScreen';
import { WakeResultScreen } from '@/screens/wake/WakeResultScreen';
import { CrewDetailScreen } from '@/screens/crew/CrewDetailScreen';
import { WakeBlastScreen } from '@/screens/crew/WakeBlastScreen';
import { GlobalLeaderboardScreen } from '@/screens/leaderboard/GlobalLeaderboardScreen';
import { ChallengesScreen } from '@/screens/challenges/ChallengesScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { PrivacySettingsScreen } from '@/screens/profile/PrivacySettingsScreen';
import { PaywallScreen } from '@/screens/paywall/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { status } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      {status === 'loading' && <Stack.Screen name="Auth" component={SplashScreen} />}
      {status === 'signedOut' && <Stack.Screen name="Auth" component={AuthScreen} />}
      {status === 'onboarding' && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}

      {status === 'ready' && (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={TabNavigator} />

          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="CreateAlarm" component={CreateAlarmScreen} />
            <Stack.Screen name="MissionSetup" component={MissionSetupScreen} />
            <Stack.Screen name="CrewDetail" component={CrewDetailScreen} />
            <Stack.Screen name="WakeBlast" component={WakeBlastScreen} />
            <Stack.Screen name="GlobalLeaderboard" component={GlobalLeaderboardScreen} />
            <Stack.Screen name="Challenges" component={ChallengesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
            <Stack.Screen name="WakeResult" component={WakeResultScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          </Stack.Group>

          <Stack.Group screenOptions={{ presentation: 'fullScreenModal', gestureEnabled: false }}>
            <Stack.Screen name="ActiveAlarm" component={ActiveAlarmScreen} />
            <Stack.Screen name="MissionExecution" component={MissionExecutionScreen} />
            <Stack.Screen name="WakeCheck" component={WakeCheckScreen} />
          </Stack.Group>
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
