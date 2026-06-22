import React from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { getCurrentUser } from '@/store/useSessionStore';
import { recordWakeCheck } from '@/features/wake/wakeService';
import { RootStackParamList } from '@/navigation/types';

export function WakeCheckScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WakeCheck'>>();

  const finish = async (passed: boolean) => {
    if (passed) haptics.success();
    else haptics.warning();
    const { userId } = getCurrentUser();
    await recordWakeCheck(userId ?? 'demo-user', route.params.alarmId, passed);
    nav.navigate('Tabs', { screen: 'Alarm' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient colors={[t.colors.gradientStart, t.colors.background]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: t.spacing.xl }}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Icon name="check" size={64} color={t.colors.accent} />
            <Text variant="h1" center>
              Toujours debout ?
            </Text>
            <Text variant="body" color="secondary" center>
              Confirme que tu ne t’es pas rendormi. Sinon ton Crew le saura. 👀
            </Text>
          </View>
          <View style={{ gap: t.spacing.sm }}>
            <Button label="Oui, je suis réveillé ✅" onPress={() => finish(true)} />
            <Button label="Je me suis recouché 💀" variant="glass" onPress={() => finish(false)} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
