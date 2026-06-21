import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { SettingRow } from '@/components/ui/SettingRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useTheme } from '@/theme';
import { BlastTone, ProofShareMode } from '@/types/domain';

export function PrivacySettingsScreen() {
  const t = useTheme();
  const [allowBlasts, setAllowBlasts] = useState(true);
  const [allowVoice, setAllowVoice] = useState(false);
  const [tone, setTone] = useState<BlastTone>('motivation');
  const [hallOfShame, setHallOfShame] = useState(true);
  const [share, setShare] = useState<ProofShareMode>('validated_only');

  return (
    <Screen scroll>
      <ModalHeader title="Confidentialité" />

      <Text variant="h3" style={{ marginTop: t.spacing.sm, marginBottom: t.spacing.sm }}>
        Wake Blasts
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow
          icon="bolt"
          label="Autoriser les Wake Blasts"
          description="Ton Crew peut te réveiller si tu es en retard"
          toggle={{ value: allowBlasts, onChange: setAllowBlasts }}
        />
        {allowBlasts && (
          <>
            <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
            <SettingRow
              icon="mission"
              label="Autoriser les vocaux"
              description="Vocaux enregistrés par tes amis"
              toggle={{ value: allowVoice, onChange: setAllowVoice }}
            />
          </>
        )}
      </GlassCard>

      {allowBlasts && (
        <>
          <Text variant="caption" color="secondary" style={{ marginTop: t.spacing.md, marginBottom: 6 }}>
            Mode autorisé
          </Text>
          <SegmentedControl
            value={tone}
            onChange={setTone}
            options={[
              { value: 'motivation', label: '💪 Motivation' },
              { value: 'roast', label: '💀 Roast (amis proches)' },
            ]}
          />
          <Text variant="caption" color="tertiary" style={{ marginTop: 8 }}>
            Fenêtre 06:00–10:00 · max 5/matin · membres blocables. Jamais de harcèlement.
          </Text>
        </>
      )}

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Preuves photo
      </Text>
      <SegmentedControl
        value={share}
        onChange={setShare}
        options={[
          { value: 'validated_only', label: 'Validée' },
          { value: 'blurred', label: 'Floutée' },
          { value: 'visible_24h', label: '24h' },
          { value: 'private', label: 'Privé' },
        ]}
      />
      <Text variant="caption" color="tertiary" style={{ marginTop: 8 }}>
        Tu peux supprimer tes preuves à tout moment.
      </Text>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Visibilité
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow
          icon="flame"
          label="Apparaître dans le Hall of Shame"
          description="Reste fun — désactivable quand tu veux"
          toggle={{ value: hallOfShame, onChange: setHallOfShame }}
        />
      </GlassCard>
    </Screen>
  );
}
