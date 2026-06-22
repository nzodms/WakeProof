import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '@/theme';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/lib/navigationRef';
import { useNotificationRouter } from '@/features/notifications/notificationRouter';
import { loadAlarms } from '@/features/alarms/alarmManager';
import { RuntimeBadge } from '@/components/dev/RuntimeBadge';
import { WebPreviewShell } from '@/components/system/WebPreviewShell';
import { injectNeoStyles, applyNeoVars } from '@/lib/webNeo';

/** Effets globaux qui dépendent de l'auth + de la navigation prête. */
function AppEffects() {
  const { status } = useAuth();
  useNotificationRouter();
  useEffect(() => {
    if (status === 'ready') void loadAlarms();
  }, [status]);
  return null;
}

function NavRoot() {
  const t = useTheme();
  React.useEffect(() => {
    injectNeoStyles();
    applyNeoVars(t);
  }, [t]);
  const navTheme = {
    ...(t.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(t.isDark ? DarkTheme : DefaultTheme).colors,
      background: t.colors.background,
      card: t.colors.surface,
      text: t.colors.text,
      primary: t.colors.accent,
      border: t.colors.glassBorder,
    },
  };
  return (
    <WebPreviewShell>
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <StatusBar style={t.isDark ? 'light' : 'dark'} />
        <AppEffects />
        <RootNavigator />
        <RuntimeBadge />
      </NavigationContainer>
    </WebPreviewShell>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavRoot />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
