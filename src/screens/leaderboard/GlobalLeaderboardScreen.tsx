import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { LEADERBOARD_CATEGORIES } from '@/constants/categories';
import { LEAGUE_META, LEAGUE_ORDER } from '@/features/leagues/leagues';

type Scope = 'global' | 'country' | 'city' | 'category';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'global', label: '🌍 Monde' },
  { id: 'country', label: '🇫🇷 Pays' },
  { id: 'city', label: '🏙 Ville' },
  { id: 'category', label: '🏷 Catégorie' },
];

const WORLD = [
  { rank: 1, username: 'aurora_6am', score: 921, country: '🇯🇵' },
  { rank: 2, username: 'disciplined_k', score: 904, country: '🇰🇷' },
  { rank: 3, username: 'enzo', score: 877, country: '🇫🇷' },
  { rank: 4, username: 'gymrat_max', score: 851, country: '🇺🇸' },
  { rank: 5, username: 'studygrind', score: 832, country: '🇩🇪' },
];

export function GlobalLeaderboardScreen() {
  const t = useTheme();
  const [scope, setScope] = useState<Scope>('global');
  const [category, setCategory] = useState(LEADERBOARD_CATEGORIES[0]!.id);

  return (
    <Screen scroll>
      <ModalHeader title="Classement mondial" />

      {/* Ligues */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {LEAGUE_ORDER.map((tier) => {
          const meta = LEAGUE_META[tier];
          return (
            <View
              key={tier}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: t.colors.glass,
                borderWidth: 1,
                borderColor: t.colors.glassBorder,
                flexDirection: 'row',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <Text>{meta.emoji}</Text>
              <Text variant="caption" style={{ color: meta.color }}>
                {meta.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.md }}>
        {SCOPES.map((s) => {
          const active = scope === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                haptics.selection();
                setScope(s.id);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: active ? t.colors.accentSoft : t.colors.glass,
                borderWidth: 1,
                borderColor: active ? t.colors.accent : t.colors.glassBorder,
              }}
            >
              <Text variant="caption" color={active ? 'accent' : 'secondary'}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {scope === 'category' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
          {LEADERBOARD_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  haptics.selection();
                  setCategory(c.id);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? t.colors.accent : t.colors.glass,
                  borderWidth: 1,
                  borderColor: active ? t.colors.accent : t.colors.glassBorder,
                }}
              >
                <Text variant="caption" style={{ color: active ? '#fff' : t.colors.textSecondary }}>
                  {c.emoji} {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={{ gap: t.spacing.sm, marginTop: t.spacing.lg }}>
        {WORLD.map((row) => (
          <GlassCard key={row.rank} glow={row.rank <= 3}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
              <Text variant="h3" color={row.rank <= 3 ? 'accent' : 'tertiary'} style={{ width: 28 }}>
                {row.rank}
              </Text>
              <Avatar name={row.username} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">
                  {row.country} {row.username}
                </Text>
              </View>
              <Text variant="h3" color="accent">
                {row.score}
              </Text>
            </View>
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}
