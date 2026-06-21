import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SettingRow } from '@/components/ui/SettingRow';
import { useTheme } from '@/theme';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { LEAGUE_META } from '@/features/leagues/leagues';
import { RootStackParamList } from '@/navigation/types';

export function ProfileScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPremium = useEntitlementsStore((s) => s.isPremium);
  const league = LEAGUE_META.gold;

  return (
    <Screen scroll tabBarSpacing>
      <View style={{ alignItems: 'center', marginTop: t.spacing.lg, gap: 10 }}>
        <Avatar name="Enzo" size={88} status="wake_verified" />
        <Text variant="h1">Enzo</Text>
        <Text variant="caption" color="secondary">
          {league.emoji} Ligue {league.label} · @enzo
        </Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
        <StatCard value="9" label="Streak 🔥" />
        <StatCard value="298" label="Wake Score" />
        <StatCard value="87%" label="Régularité" />
      </View>

      {!isPremium && (
        <GlassCard glow radiusKey="xl" style={{ marginTop: t.spacing.lg }}>
          <Text variant="micro" color="accent">
            WAKEPROOF PREMIUM
          </Text>
          <Text variant="h3" style={{ marginTop: 4 }}>
            Débloque tout le potentiel
          </Text>
          <Text variant="caption" color="secondary" style={{ marginVertical: 8 }}>
            Alarmes illimitées, Wake Blast vocal, classements avancés, challenges et mode Hardcore.
          </Text>
          <Button label="Passer Premium" onPress={() => nav.navigate('Paywall')} />
        </GlassCard>
      )}

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Compte
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow icon="profile" label="Réglages" chevron onPress={() => nav.navigate('Settings')} />
        <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
        <SettingRow icon="lock" label="Confidentialité & social" chevron onPress={() => nav.navigate('PrivacySettings')} />
        <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
        <SettingRow icon="leaderboard" label="Mes statistiques" chevron onPress={() => {}} />
      </GlassCard>
    </Screen>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <GlassCard style={{ flex: 1 }}>
      <Text variant="h1" color="accent" style={{ fontSize: 26 }}>
        {value}
      </Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </GlassCard>
  );
}
