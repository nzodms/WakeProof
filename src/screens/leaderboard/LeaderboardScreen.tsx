import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { StatusChip } from '@/components/ui/StatusChip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

type Scope = 'crew' | 'world' | 'friends';

const RANKING: { rank: number; name: string; score: number; streak: number; delta: number; badge?: string }[] = [
  { rank: 1, name: 'Hugo', score: 312, streak: 14, delta: 1, badge: 'Early Beast' },
  { rank: 2, name: 'Enzo', score: 298, streak: 9, delta: 1, badge: 'No Snooze' },
  { rank: 3, name: 'Lucas', score: 271, streak: 6, delta: -2, badge: 'Comeback' },
  { rank: 4, name: 'Max', score: 184, streak: 0, delta: 0 },
];

export function LeaderboardScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scope, setScope] = useState<Scope>('crew');

  return (
    <Screen scroll tabBarSpacing>
      <Animated.View entering={FadeInDown.duration(360)}>
        <Text variant="h1">Classement</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
          Qui gagne vraiment ses matins ?
        </Text>
      </Animated.View>

      {/* Carte ligue */}
      <Animated.View entering={FadeInDown.duration(420).delay(80)}>
        <GlassCard variant="raised-strong" radiusKey="xl" style={{ marginTop: 16 }} onPress={() => nav.navigate('GlobalLeaderboard')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,204,0,0.16)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="trophy" size={28} color="#FFB300" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="micro" color="secondary">TA LIGUE</Text>
              <Text variant="h2" style={{ color: '#FFB300' }}>Gold League</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color="secondary">Rang</Text>
              <Text variant="h2">#2</Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceSoft, marginTop: 16, overflow: 'hidden' }}>
            <View style={{ width: '64%', height: 8, borderRadius: 4, backgroundColor: '#FFB300' }} />
          </View>
          <Text variant="caption" color="secondary" style={{ marginTop: 8 }}>
            Top 5 montent en Platine · bottom 5 redescendent dimanche.
          </Text>
        </GlassCard>
      </Animated.View>

      <View style={{ marginTop: 16 }}>
        <SegmentedControl
          value={scope}
          onChange={setScope}
          options={[
            { value: 'crew', label: 'Crew' },
            { value: 'world', label: 'Monde' },
            { value: 'friends', label: 'Amis' },
          ]}
        />
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        {RANKING.map((r, i) => (
          <Animated.View key={r.rank} entering={FadeInDown.duration(360).delay(120 + i * 60)}>
            <GlassCard padded={false} variant={r.rank === 2 ? 'raised-strong' : 'raised'}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <Text variant="h3" style={{ width: 22, color: r.rank <= 3 ? t.colors.accent : t.colors.textTertiary }}>
                  {r.rank}
                </Text>
                <Avatar name={r.name} size={42} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="bodyStrong">{r.name}</Text>
                    {r.rank === 2 && <StatusChip label="TOI" tone="accent" dot={false} />}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <Ionicons name="flame" size={13} color={t.colors.warning} />
                    <Text variant="caption" color="secondary">{r.streak} j</Text>
                    {r.badge && <StatusChip label={r.badge} tone="neutral" dot={false} />}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="h3" color="accent">{r.score}</Text>
                  <Variation delta={r.delta} />
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

function Variation({ delta }: { delta: number }) {
  const t = useTheme();
  if (delta === 0) return <Text variant="micro" color="tertiary">—</Text>;
  const up = delta > 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={11} color={up ? t.colors.success : t.colors.danger} />
      <Text variant="micro" style={{ color: up ? t.colors.success : t.colors.danger }}>
        {Math.abs(delta)}
      </Text>
    </View>
  );
}
