import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { RootStackParamList } from '@/navigation/types';

export function MissionsScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPremium = useEntitlementsStore((s) => s.isPremium);
  const missions = MissionEngine.list();

  return (
    <Screen scroll tabBarSpacing>
      <Text variant="caption" color="secondary">
        Le moteur
      </Text>
      <Text variant="h1">Missions</Text>
      <Text variant="body" color="secondary" style={{ marginTop: 4 }}>
        Chaque réveil exige une mission vérifiable. Choisis ta friction.
      </Text>

      <View style={{ gap: t.spacing.md, marginTop: t.spacing.lg }}>
        {missions.map((m) => {
          const locked = m.meta.isPremium && !isPremium;
          return (
            <Pressable
              key={m.meta.type}
              onPress={() =>
                locked
                  ? nav.navigate('Paywall', { reason: 'missions' })
                  : nav.navigate('MissionSetup', { missionType: m.meta.type })
              }
            >
              <GlassCard glow={!locked && m.meta.intensity === 3}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: t.colors.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={locked ? 'lock' : (m.meta.icon as never)} size={22} color={t.colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text variant="bodyStrong">{m.meta.title}</Text>
                      {m.meta.isPremium && <Badge label="Premium" tone="accent" />}
                    </View>
                    <Text variant="caption" color="secondary">
                      {m.meta.subtitle}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      <Badge
                        label={['Doux', 'Moyen', 'Intense'][m.meta.intensity - 1] ?? 'Moyen'}
                        tone={m.meta.intensity === 3 ? 'danger' : 'neutral'}
                      />
                      {m.meta.requiresCamera && <Badge label="Caméra" tone="neutral" />}
                      {m.meta.requiresSensor && <Badge label="Capteur" tone="neutral" />}
                    </View>
                  </View>
                  <Icon name="chevron" size={18} color={t.colors.textTertiary} />
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
