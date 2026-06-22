import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useTheme } from '@/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { RootStackParamList } from '@/navigation/types';

export function ProfileScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPremium = useEntitlementsStore((s) => s.isPremium);
  const { profile } = useAuth();
  const name = profile?.displayName ?? profile?.username ?? 'Enzo';
  const handle = profile?.username ?? 'enzo';

  return (
    <Screen scroll tabBarSpacing>
      <Animated.View entering={FadeInDown.duration(360)} style={{ alignItems: 'center', marginTop: 8, gap: 12 }}>
        <Avatar name={name} size={92} status="wake_verified" />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text variant="h1">{name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trophy" size={14} color="#FFB300" />
            <Text variant="caption" color="secondary">
              Gold League · @{handle}
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(80)} style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <BigStat value={9} label="Série" suffix=" j" />
        <BigStat value={298} label="Wake Score" />
        <BigStat value={87} label="Régularité" suffix=" %" />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(420).delay(160)}>
        <GlassCard style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="sparkles-outline" size={20} color={t.colors.accent} />
            <Text variant="h3">Ton style de réveil</Text>
          </View>
          <Text variant="body" color="secondary" style={{ marginTop: 8 }}>
            Tu réussis mieux avec des missions physiques. Tu coupes ton réveil 2× plus vite après une
            séance de squats qu’avec un simple calcul.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <StatusChip label="Early Beast" tone="success" dot={false} />
            <StatusChip label="No Snooze" tone="accent" dot={false} />
          </View>
        </GlassCard>
      </Animated.View>

      {!isPremium && (
        <Animated.View entering={FadeInDown.duration(420).delay(220)}>
          <GlassCard variant="raised-strong" radiusKey="xl" style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="diamond-outline" size={20} color={t.colors.accent} />
              <Text variant="h3">WakeProof Premium</Text>
            </View>
            <Text variant="caption" color="secondary" style={{ marginVertical: 10 }}>
              Alarmes illimitées, Wake Blast vocal, classements avancés, challenges et mode Hardcore.
            </Text>
            <Button label="Passer Premium" onPress={() => nav.navigate('Paywall')} />
          </GlassCard>
        </Animated.View>
      )}

      <Text variant="h3" style={{ marginTop: 24, marginBottom: 10 }}>
        Compte
      </Text>
      <Animated.View entering={FadeInDown.duration(420).delay(280)}>
        <GlassCard padded={false}>
          <NavRow icon="settings-outline" label="Réglages" onPress={() => nav.navigate('Settings')} />
          <Divider />
          <NavRow icon="lock-closed-outline" label="Confidentialité & social" onPress={() => nav.navigate('PrivacySettings')} />
          <Divider />
          <NavRow icon="stats-chart-outline" label="Mes statistiques" onPress={() => {}} last />
        </GlassCard>
      </Animated.View>
    </Screen>
  );
}

function BigStat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  return (
    <GlassCard style={{ flex: 1 }} padded={false}>
      <View style={{ padding: 14, gap: 2, alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <AnimatedNumber value={value} variant="h1" color="accent" />
          {suffix && (
            <Text variant="h3" color="accent">
              {suffix}
            </Text>
          )}
        </View>
        <Text variant="micro" color="secondary" style={{ letterSpacing: 0 }}>
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

function NavRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; last?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 16, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={18} color={t.colors.accent} />
        </View>
        <Text variant="body" style={{ flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={t.colors.textTertiary} />
      </View>
    </Pressable>
  );
}

function Divider() {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.glassBorder, marginLeft: 64 }} />;
}
