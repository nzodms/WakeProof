import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { StatusChip } from '@/components/ui/StatusChip';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { RootStackParamList } from '@/navigation/types';
import { MissionType } from '@/types/domain';

type Cat = 'all' | 'fast' | 'physical' | 'proof' | 'hardcore';

interface MissionMeta {
  type: MissionType;
  cat: Exclude<Cat, 'all'>;
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  desc: string;
  level: string;
  duration: string;
  tags: string[];
  premium: boolean;
  preview: string;
}

const MISSIONS: MissionMeta[] = [
  { type: 'calc', cat: 'fast', icon: 'calculator-outline', name: 'Calcul mental', desc: 'Résous 3 calculs avant de couper l’alarme.', level: 'Doux', duration: '~30 s', tags: [], premium: false, preview: 'Exemple : 14 × 3 = ?' },
  { type: 'shake', cat: 'physical', icon: 'phone-portrait-outline', name: 'Shake', desc: 'Secoue le téléphone pour décoller du lit.', level: 'Moyen', duration: '~20 s', tags: ['Capteur'], premium: false, preview: 'Exemple : 25 secousses énergiques.' },
  { type: 'steps', cat: 'physical', icon: 'walk-outline', name: 'Marche', desc: 'Sors du lit et fais quelques pas.', level: 'Moyen', duration: '~40 s', tags: ['Capteur'], premium: false, preview: 'Exemple : 30 pas hors du lit.' },
  { type: 'photo_proof', cat: 'proof', icon: 'camera-outline', name: 'Photo proof', desc: 'Prouve que tu es debout avec une photo en direct.', level: 'Moyen', duration: '~30 s', tags: ['Caméra'], premium: false, preview: 'Exemple : prends une photo de ta tasse de café.' },
  { type: 'qr_code', cat: 'proof', icon: 'qr-code-outline', name: 'QR code', desc: 'Scanne un QR placé loin du lit.', level: 'Intense', duration: '~30 s', tags: ['Caméra'], premium: false, preview: 'Exemple : QR collé dans la salle de bain.' },
  { type: 'squats', cat: 'hardcore', icon: 'fitness-outline', name: 'Squats', desc: 'Ton corps doit confirmer que tu es réveillé.', level: 'Intense', duration: '~60 s', tags: ['Capteur', 'Premium'], premium: true, preview: 'Exemple : 10 squats comptés.' },
  { type: 'wake_check', cat: 'hardcore', icon: 'eye-outline', name: 'Wake Check', desc: 'On vérifie que tu n’es pas retourné dormir.', level: 'Intense', duration: '+5 min', tags: ['Premium'], premium: true, preview: 'Exemple : confirme 5 min après le réveil.' },
];

const CATS: { id: Cat; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'fast', label: 'Rapide' },
  { id: 'physical', label: 'Physique' },
  { id: 'proof', label: 'Preuve' },
  { id: 'hardcore', label: 'Hardcore' },
];

export function MissionsScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPremium = useEntitlementsStore((s) => s.isPremium);
  const [cat, setCat] = useState<Cat>('all');

  const list = MISSIONS.filter((m) => cat === 'all' || m.cat === cat);

  return (
    <Screen scroll tabBarSpacing>
      <Animated.View entering={FadeInDown.duration(360)}>
        <Text variant="h1">Missions</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
          Choisis comment tu prouves que tu es debout.
        </Text>
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
        {CATS.map((c) => {
          const active = cat === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => { haptics.selection(); setCat(c.id); }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: active ? t.colors.accent : t.colors.surface,
                borderWidth: active ? 0 : 1,
                borderColor: t.colors.glassBorder,
              }}
            >
              <Text variant="caption" style={{ color: active ? '#fff' : t.colors.textSecondary, fontWeight: '600' }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ gap: 12, marginTop: 16 }}>
        {list.map((m, i) => {
          const locked = m.premium && !isPremium;
          return (
            <Animated.View key={m.type} entering={FadeInDown.duration(360).delay(i * 60)}>
              <GlassCard
                padded={false}
                onPress={() =>
                  locked ? nav.navigate('Paywall', { reason: 'missions' }) : nav.navigate('MissionSetup', { missionType: m.type })
                }
              >
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: t.colors.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={locked ? 'lock-closed-outline' : m.icon} size={22} color={t.colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text variant="bodyStrong">{m.name}</Text>
                        {m.premium && <StatusChip label="PREMIUM" tone="warning" dot={false} />}
                      </View>
                      <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                        {m.desc}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <StatusChip label={m.level} tone={m.cat === 'hardcore' ? 'danger' : 'neutral'} dot={false} />
                    <StatusChip label={m.duration} tone="neutral" dot={false} />
                    {m.tags.map((tag) => (
                      <StatusChip key={tag} label={tag} tone="accent" dot={false} />
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    <Ionicons name="bulb-outline" size={14} color={t.colors.textTertiary} />
                    <Text variant="caption" color="tertiary">
                      {m.preview}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}
