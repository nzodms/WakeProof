import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useCrewStore } from '@/store/useCrewStore';
import { PRESET_BLASTS } from '@/features/wakeBlast/wakeBlast';
import { RootStackParamList } from '@/navigation/types';
import { BlastKind, BlastTone } from '@/types/domain';

const KINDS: { id: BlastKind; label: string; icon: 'bolt' | 'flame' | 'mission' | 'crew' }[] = [
  { id: 'voice', label: 'Vocal', icon: 'bolt' },
  { id: 'tts_text', label: 'Texte → voix', icon: 'mission' },
  { id: 'preset_sound', label: 'Son prédéfini', icon: 'flame' },
  { id: 'vote', label: 'Vote du groupe', icon: 'crew' },
];

export function WakeBlastScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'WakeBlast'>>();
  const members = useCrewStore((s) => s.members);
  const target = members.find((m) => m.userId === route.params.targetId);

  const [tone, setTone] = useState<BlastTone>('motivation');
  const [kind, setKind] = useState<BlastKind>('preset_sound');
  const [text, setText] = useState('');
  const [preset, setPreset] = useState(PRESET_BLASTS[0]!.id);
  const [recording, setRecording] = useState(false);

  const presets = PRESET_BLASTS.filter((p) => tone === 'roast' || p.tone === 'motivation');

  const send = () => {
    haptics.success();
    // Ici : insert wake_blasts + broadcast realtime. Re-vérif serveur des règles.
    nav.goBack();
  };

  return (
    <Screen scroll>
      <ModalHeader title="Wake Blast" />

      <GlassCard glow radiusKey="xl">
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 36 }}>📣</Text>
          <Text variant="h2">Réveille {target?.username ?? 'ton pote'}</Text>
          <Text variant="caption" color="secondary" center>
            {target?.lateMinutes ?? 0} min de retard · fais-le décoller du lit
          </Text>
        </View>
      </GlassCard>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Ton
      </Text>
      <SegmentedControl
        value={tone}
        onChange={setTone}
        options={[
          { value: 'motivation', label: '💪 Motivation' },
          { value: 'roast', label: '💀 Roast' },
        ]}
      />
      {tone === 'roast' && (
        <Text variant="caption" color="warning" style={{ marginTop: 8 }}>
          Mode roast réservé aux amis proches qui l’acceptent. Reste fun, jamais toxique.
        </Text>
      )}

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Type
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KINDS.map((k) => {
          const active = kind === k.id;
          return (
            <Pressable
              key={k.id}
              onPress={() => {
                haptics.selection();
                setKind(k.id);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: active ? t.colors.accentSoft : t.colors.glass,
                borderWidth: 1,
                borderColor: active ? t.colors.accent : t.colors.glassBorder,
              }}
            >
              <Icon name={k.icon} size={16} color={active ? t.colors.accent : t.colors.textSecondary} />
              <Text variant="caption" color={active ? 'accent' : 'secondary'}>
                {k.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: t.spacing.lg }}>
        {kind === 'preset_sound' && (
          <View style={{ gap: t.spacing.sm }}>
            {presets.map((p) => {
              const active = preset === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    haptics.selection();
                    setPreset(p.id);
                  }}
                >
                  <GlassCard style={active ? { borderColor: t.colors.accent } : undefined}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text variant="bodyStrong">{p.label}</Text>
                      {active && <Icon name="check" size={20} color={t.colors.accent} />}
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}

        {kind === 'tts_text' && (
          <GlassCard>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Gros réveille-toi, tu branles quoi ?"
              placeholderTextColor={t.colors.textTertiary}
              multiline
              style={{ color: t.colors.text, fontSize: 16, minHeight: 60 }}
            />
          </GlassCard>
        )}

        {kind === 'voice' && (
          <Pressable
            onPress={() => {
              haptics.impact('heavy');
              setRecording((r) => !r);
            }}
          >
            <GlassCard glow={recording}>
              <View style={{ alignItems: 'center', gap: 10, paddingVertical: 12 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: recording ? t.colors.danger : t.colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={recording ? 'close' : 'bolt'} size={28} color="#fff" />
                </View>
                <Text variant="caption" color="secondary">
                  {recording ? 'Enregistrement… touche pour arrêter' : 'Touche pour enregistrer ton vocal'}
                </Text>
              </View>
            </GlassCard>
          </Pressable>
        )}

        {kind === 'vote' && (
          <GlassCard>
            <Text variant="bodyStrong">Wake Blast collectif</Text>
            <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
              Lance un vote : si le quorum du Crew est atteint, un blast groupé part automatiquement.
              Personne ne se fait harceler seul.
            </Text>
          </GlassCard>
        )}
      </View>

      <View style={{ marginTop: t.spacing.xl }}>
        <Button
          label={kind === 'vote' ? 'Lancer le vote' : 'Envoyer le Wake Blast'}
          variant={tone === 'roast' ? 'danger' : 'primary'}
          onPress={send}
        />
      </View>
    </Screen>
  );
}
