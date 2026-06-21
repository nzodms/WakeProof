import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { CHALLENGE_PRESETS } from '@/constants/categories';

export function ChallengesScreen() {
  const t = useTheme();

  return (
    <Screen scroll>
      <ModalHeader title="Challenges" />

      {/* Challenge actif */}
      <GlassCard glow radiusKey="xl">
        <Badge label="En cours" tone="success" />
        <Text variant="h2" style={{ marginTop: 8 }}>
          7 jours réveil validé ✅
        </Text>
        <Text variant="caption" color="secondary">
          Jour 4/7 · 3 membres encore en lice
        </Text>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.glass, marginTop: 12, overflow: 'hidden' }}>
          <View style={{ width: '57%', height: 8, backgroundColor: t.colors.accent }} />
        </View>
      </GlassCard>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Lancer un challenge
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md }}>
        {CHALLENGE_PRESETS.map((c) => (
          <GlassCard key={c.type} style={{ width: '47%' }}>
            <Text style={{ fontSize: 30 }}>{c.emoji}</Text>
            <Text variant="bodyStrong" style={{ marginTop: 8 }}>
              {c.title}
            </Text>
            <Text variant="caption" color="secondary">
              {c.days} jours
            </Text>
          </GlassCard>
        ))}
      </View>

      <View style={{ marginTop: t.spacing.xl }}>
        <Button label="Créer un challenge" onPress={() => haptics.impact('medium')} />
      </View>
    </Screen>
  );
}
