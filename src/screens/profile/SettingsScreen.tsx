import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { SettingRow } from '@/components/ui/SettingRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme, useThemeControls } from '@/theme';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';

export function SettingsScreen() {
  const t = useTheme();
  const { override, setOverride } = useThemeControls();
  const { isPremium, setPremium } = useEntitlementsStore();

  return (
    <Screen scroll>
      <ModalHeader title="Réglages" />

      <Text variant="h3" style={{ marginTop: t.spacing.sm, marginBottom: t.spacing.sm }}>
        Apparence
      </Text>
      <SegmentedControl
        value={override}
        onChange={setOverride}
        options={[
          { value: 'system', label: 'Système' },
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre' },
        ]}
      />

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Alarme
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow icon="alarm" label="Son par défaut" value="Rise" chevron onPress={() => {}} />
        <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
        <SettingRow icon="bolt" label="Vibration" toggle={{ value: true, onChange: () => {} }} />
        <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
        <SettingRow icon="flame" label="Volume progressif" toggle={{ value: true, onChange: () => {} }} />
      </GlassCard>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Développeur (démo)
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow
          icon="lock"
          label="Simuler Premium"
          description="Débloque les features premium pour tester"
          toggle={{ value: isPremium, onChange: setPremium }}
        />
      </GlassCard>

      <Text variant="caption" color="tertiary" center style={{ marginTop: t.spacing.xl }}>
        WakeProof v0.1.0 · MVP
      </Text>
    </Screen>
  );
}
