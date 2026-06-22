import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function SplashScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient colors={[t.colors.gradientStart, t.colors.background]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Text variant="display" style={{ fontSize: 40 }}>
          WakeProof
        </Text>
        <ActivityIndicator color={t.colors.accent} />
      </LinearGradient>
    </View>
  );
}
