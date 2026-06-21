import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme';
import { useCrewStore } from '@/store/useCrewStore';
import { DEMO_LEADERBOARD } from '@/constants/demoData';
import { LEAGUE_META } from '@/features/leagues/leagues';
import { RootStackParamList } from '@/navigation/types';

type Period = 'daily' | 'weekly' | 'monthly';

export function LeaderboardScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const crew = useCrewStore((s) => s.crews[0]);
  const [period, setPeriod] = useState<Period>('weekly');
  const league = LEAGUE_META.gold;

  return (
    <Screen scroll tabBarSpacing>
      <Text variant="caption" color="secondary">
        Compétition
      </Text>
      <Text variant="h1">Classement</Text>

      {/* Ma ligue */}
      <GlassCard glow radiusKey="xl" style={{ marginTop: t.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <Text style={{ fontSize: 40 }}>{league.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="micro" color="secondary">
              TA LIGUE
            </Text>
            <Text variant="h2" style={{ color: league.color }}>
              {league.label}
            </Text>
            <Text variant="caption" color="secondary">
              Top 5 montent · bottom 5 descendent chaque semaine
            </Text>
          </View>
        </View>
      </GlassCard>

      <View style={{ marginTop: t.spacing.lg }}>
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'daily', label: 'Jour' },
            { value: 'weekly', label: 'Semaine' },
            { value: 'monthly', label: 'Mois' },
          ]}
        />
      </View>

      <Text variant="h3" style={{ marginTop: t.spacing.lg, marginBottom: t.spacing.sm }}>
        {crew?.name ?? 'Mon Crew'}
      </Text>
      <View style={{ gap: t.spacing.sm }}>
        {DEMO_LEADERBOARD.map((row) => (
          <GlassCard key={row.rank} glow={row.rank === 1}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
              <Text variant="h3" color={row.rank <= 3 ? 'accent' : 'tertiary'} style={{ width: 28 }}>
                {row.rank}
              </Text>
              <Avatar name={row.username} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{row.username}</Text>
                <Text variant="caption" color="secondary">
                  Wake Score · 🔥 {row.streak}j
                </Text>
              </View>
              <Text variant="h3" color="accent">
                {row.score}
              </Text>
            </View>
          </GlassCard>
        ))}
      </View>

      <View style={{ marginTop: t.spacing.lg }}>
        <Button label="Classement mondial" variant="glass" onPress={() => nav.navigate('GlobalLeaderboard')} />
      </View>
    </Screen>
  );
}
