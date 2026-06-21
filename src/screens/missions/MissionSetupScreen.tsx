import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { RootStackParamList } from '@/navigation/types';
import { MissionType } from '@/types/domain';

const PHOTO_TARGETS = ['tasse de café', 'bureau', 'chaussures de sport', 'sac de cours', 'ordinateur allumé', 'salle de bain'];

export function MissionSetupScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'MissionSetup'>>();
  const missionType: MissionType = route.params?.missionType ?? 'calc';
  const def = MissionEngine.get(missionType);

  const [config, setConfig] = useState<Record<string, unknown>>({ ...(def.defaultConfig as object) });

  const numericKey =
    missionType === 'calc'
      ? 'count'
      : missionType === 'shake' || missionType === 'steps' || missionType === 'squats'
        ? 'target'
        : null;

  const bump = (delta: number) => {
    if (!numericKey) return;
    haptics.selection();
    setConfig((c) => ({ ...c, [numericKey]: Math.max(1, Number(c[numericKey] ?? 1) + delta) }));
  };

  return (
    <Screen scroll>
      <ModalHeader title={def.meta.title} />
      <GlassCard radiusKey="xl" glow>
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 8 }}>
          <Icon name={def.meta.icon as never} size={48} color={t.colors.accent} />
          <Text variant="h2">{def.meta.title}</Text>
          <Text variant="caption" color="secondary" center>
            {def.meta.subtitle}
          </Text>
        </View>
      </GlassCard>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Réglages
      </Text>

      {numericKey && (
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyStrong">
              {missionType === 'calc' ? 'Nombre de calculs' : 'Objectif'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg }}>
              <RoundBtn icon="close" onPress={() => bump(-(missionType === 'calc' ? 1 : 5))} />
              <Text variant="h2" style={{ minWidth: 48, textAlign: 'center' }}>
                {String(config[numericKey])}
              </Text>
              <RoundBtn icon="plus" onPress={() => bump(missionType === 'calc' ? 1 : 5)} />
            </View>
          </View>
        </GlassCard>
      )}

      {missionType === 'photo_proof' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PHOTO_TARGETS.map((target) => {
            const active = config.target === target;
            return (
              <Pressable
                key={target}
                onPress={() => {
                  haptics.selection();
                  setConfig((c) => ({ ...c, target }));
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
                  {target}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {missionType === 'wake_check' && (
        <GlassCard>
          <Pressable
            onPress={() => {
              haptics.selection();
              setConfig((c) => ({ ...c, delayMin: c.delayMin === 5 ? 10 : 5 }));
            }}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text variant="bodyStrong">Re-check après</Text>
            <Text variant="h3" color="accent">
              {String(config.delayMin)} min
            </Text>
          </Pressable>
        </GlassCard>
      )}

      {missionType === 'qr_code' && (
        <Text variant="caption" color="secondary">
          Imprime ou affiche un QR WakeProof dans une autre pièce. Tu devras te lever pour le scanner.
        </Text>
      )}

      <View style={{ marginTop: t.spacing.xl }}>
        <Button label="Utiliser cette mission" onPress={() => nav.goBack()} />
      </View>
    </Screen>
  );
}

function RoundBtn({ icon, onPress }: { icon: 'plus' | 'close'; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: t.colors.glass,
        borderWidth: 1,
        borderColor: t.colors.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={18} color={t.colors.text} />
    </Pressable>
  );
}
