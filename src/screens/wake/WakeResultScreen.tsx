import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { RootStackParamList } from '@/navigation/types';

export function WakeResultScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WakeResult'>>();
  const score = route.params.score;

  useEffect(() => {
    haptics.success();
  }, []);

  return (
    <Screen withHalos>
      <View style={{ flex: 1, justifyContent: 'center', gap: t.spacing.xl }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', gap: 6 }}>
          <Text variant="micro" color="accent">
            RÉVEIL VALIDÉ
          </Text>
          <Text style={{ fontSize: 30 }}>🔥</Text>
          <Text variant="h1" center>
            Mission accomplie
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(380).delay(120)}>
          <GlassCard glow radiusKey="xl">
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text variant="caption" color="secondary">
                Wake Score du jour
              </Text>
              <Text variant="display" color="accent">
                +{score}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Text variant="body" color="secondary" center>
          Ton score alimente le classement de ton Crew et ta ligue. Continue ta série pour grimper.
        </Text>
      </View>

      <Button label="Continuer" onPress={() => nav.navigate('Tabs', { screen: 'Alarm' })} />
    </Screen>
  );
}
