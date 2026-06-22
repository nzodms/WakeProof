import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuth } from '@/features/auth/AuthProvider';
import { saveAlarm } from '@/features/alarms/alarmManager';
import { requestNotificationPermission } from '@/lib/notifications';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { MissionType } from '@/types/domain';

type Step = 'hero' | 'goal' | 'mission' | 'alarm';
const ORDER: Step[] = ['hero', 'goal', 'mission', 'alarm'];

const GOALS: { id: string; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'work', label: 'Travail', sub: 'Ne plus être en retard', icon: 'briefcase-outline' },
  { id: 'gym', label: 'Sport', sub: 'Séance matinale garantie', icon: 'barbell-outline' },
  { id: 'study', label: 'Études', sub: 'Commencer la journée tôt', icon: 'school-outline' },
  { id: 'discipline', label: 'Discipline', sub: 'Construire une routine', icon: 'flame-outline' },
  { id: 'no_snooze', label: 'Stop snooze', sub: 'Arrêter de repousser', icon: 'alarm-outline' },
];

const MISSIONS: { id: MissionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'calc', label: 'Calcul', icon: 'calculator-outline' },
  { id: 'photo_proof', label: 'Photo', icon: 'camera-outline' },
  { id: 'qr_code', label: 'QR code', icon: 'qr-code-outline' },
  { id: 'steps', label: 'Marche', icon: 'walk-outline' },
  { id: 'squats', label: 'Squats', icon: 'fitness-outline' },
];

export function OnboardingScreen() {
  const t = useTheme();
  const { completeOnboarding } = useAuth();
  const { goal, setGoal } = useOnboardingStore();
  const [step, setStep] = useState<Step>('hero');
  const [missionType, setMissionType] = useState<MissionType>('photo_proof');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const idx = ORDER.indexOf(step);

  const next = async () => {
    haptics.impact('light');
    if (step === 'goal') void requestNotificationPermission();
    if (idx < ORDER.length - 1) {
      setStep(ORDER[idx + 1]!);
      return;
    }
    // Dernière étape : crée le premier réveil puis termine l'onboarding.
    setFinishing(true);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    await saveAlarm({
      id: `a${Date.now()}`,
      label: 'Mon réveil',
      timeLocal: time,
      weekdays: [1, 2, 3, 4, 5],
      difficulty: 'strict',
      soundId: 'default',
      snoozeAllowed: false,
      maxSnoozes: 0,
      missionType,
      missionConfig: MissionEngine.get(missionType).defaultConfig as Record<string, unknown>,
      crewId: null,
      wakeBlastEnabled: false,
      wakeBlastDelayMin: 5,
      gracePeriodMin: 2,
      isActive: true,
    });
    await completeOnboarding({ goal: goal ?? 'discipline' });
    setFinishing(false);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      {/* Progression */}
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {ORDER.map((s, i) => (
          <View
            key={s}
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i <= idx ? t.colors.accent : t.colors.glassBorder,
            }}
          />
        ))}
      </View>

      <Animated.View key={step} entering={FadeIn.duration(260)} style={{ flex: 1 }}>
        {step === 'hero' && <HeroStep />}
        {step === 'goal' && <GoalStep goal={goal} setGoal={setGoal} />}
        {step === 'mission' && <MissionStep value={missionType} onChange={setMissionType} />}
        {step === 'alarm' && (
          <AlarmStep hour={hour} minute={minute} setHour={setHour} setMinute={setMinute} />
        )}
      </Animated.View>

      <View style={{ gap: 8, paddingBottom: 8 }}>
        <Button
          label={step === 'alarm' ? 'Créer mon réveil' : 'Continuer'}
          onPress={next}
          loading={finishing}
          disabled={step === 'goal' && !goal}
        />
      </View>
    </Screen>
  );
}

function HeroStep() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
      <Text style={{ fontSize: 96, fontWeight: '200', letterSpacing: -3, color: t.colors.text }} center>
        06:30
      </Text>
      <View style={{ gap: 8, alignItems: 'center' }}>
        <Text variant="h1" center>
          Réveille-toi pour de vrai.
        </Text>
        <Text variant="body" color="secondary" center style={{ paddingHorizontal: 12 }}>
          WakeProof ne s’éteint pas tant que tu n’as pas accompli ta mission.
        </Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <GlassCard padded={false} style={{ width: 240 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: t.colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="camera-outline" size={20} color={t.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">Photo café</Text>
              <Text variant="caption" color="secondary">
                Mission · 07:05
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={t.colors.success} />
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

function GoalStep({ goal, setGoal }: { goal: string | null; setGoal: (g: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, paddingTop: 20, gap: 12 }}>
      <Text variant="h1">Ton objectif ?</Text>
      <Text variant="body" color="secondary" style={{ marginBottom: 4 }}>
        On adapte tes missions et classements.
      </Text>
      <View style={{ gap: 10 }}>
        {GOALS.map((g) => {
          const active = goal === g.id;
          return (
            <Pressable
              key={g.id}
              onPress={() => {
                haptics.selection();
                setGoal(g.id);
              }}
            >
              <GlassCard padded={false} glow={active} style={active ? { borderColor: t.colors.accent } : undefined}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: active ? t.colors.accent : t.colors.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={g.icon} size={20} color={active ? '#fff' : t.colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{g.label}</Text>
                    <Text variant="caption" color="secondary">
                      {g.sub}
                    </Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={22} color={t.colors.accent} />}
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MissionStep({ value, onChange }: { value: MissionType; onChange: (m: MissionType) => void }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, paddingTop: 20, gap: 12 }}>
      <Text variant="h1">Ta première mission</Text>
      <Text variant="body" color="secondary" style={{ marginBottom: 4 }}>
        Ce que tu devras accomplir pour couper l’alarme.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {MISSIONS.map((m) => {
          const active = value === m.id;
          return (
            <Pressable key={m.id} onPress={() => { haptics.selection(); onChange(m.id); }} style={{ width: '48%' }}>
              <GlassCard padded={false} glow={active} style={active ? { borderColor: t.colors.accent } : undefined}>
                <View style={{ padding: 16, gap: 10, alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      backgroundColor: active ? t.colors.accent : t.colors.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={m.icon} size={22} color={active ? '#fff' : t.colors.accent} />
                  </View>
                  <Text variant="bodyStrong">{m.label}</Text>
                </View>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AlarmStep({
  hour,
  minute,
  setHour,
  setMinute,
}: {
  hour: number;
  minute: number;
  setHour: (n: number) => void;
  setMinute: (n: number) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, paddingTop: 20, gap: 16 }}>
      <Text variant="h1">Ton premier réveil</Text>
      <Text variant="body" color="secondary">
        Tu pourras tout ajuster plus tard.
      </Text>
      <GlassCard radiusKey="xl" style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
          <Wheel value={hour} max={23} onChange={setHour} />
          <Text style={{ fontSize: 60, fontWeight: '200', color: t.colors.textTertiary }}>:</Text>
          <Wheel value={minute} max={59} step={5} onChange={setMinute} />
        </View>
      </GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <Ionicons name="information-circle-outline" size={16} color={t.colors.textTertiary} />
        <Text variant="caption" color="tertiary">
          En semaine · mission obligatoire · sans snooze
        </Text>
      </View>
    </View>
  );
}

function Wheel({ value, max, step = 1, onChange }: { value: number; max: number; step?: number; onChange: (n: number) => void }) {
  const t = useTheme();
  const bump = (dir: 1 | -1) => {
    haptics.selection();
    let n = value + dir * step;
    if (n < 0) n = max;
    if (n > max) n = 0;
    onChange(n);
  };
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Pressable onPress={() => bump(1)} hitSlop={12}>
        <Ionicons name="chevron-up" size={22} color={t.colors.textTertiary} />
      </Pressable>
      <Text style={{ fontSize: 56, fontWeight: '300', letterSpacing: -2, color: t.colors.text }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Pressable onPress={() => bump(-1)} hitSlop={12}>
        <Ionicons name="chevron-down" size={22} color={t.colors.textTertiary} />
      </Pressable>
    </View>
  );
}
