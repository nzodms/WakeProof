import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useCrewStore } from '@/store/useCrewStore';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { publishAlarmStatus, logSnooze } from '@/features/wake/completeWakeFlow';
import { RootStackParamList } from '@/navigation/types';

const HYPE = [
  'Debout. Le lit, c’est fini.',
  'Tes potes te regardent. Fais pas le mort.',
  'Une mission te sépare de ta journée.',
  '1 % de discipline > 100 % de motivation.',
];

const DIFFICULTY_LABEL = { easy: 'Facile', strict: 'Strict', hardcore: 'Hardcore' } as const;
const DIFFICULTY_TONE = { easy: 'success', strict: 'accent', hardcore: 'danger' } as const;

export function ActiveAlarmScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ActiveAlarm'>>();
  const getAlarm = useAlarmStore((s) => s.getAlarm);
  const ringingStartedAt = useAlarmStore((s) => s.ringingStartedAt);
  const dismissAlarm = useAlarmStore((s) => s.dismissAlarm);
  const triggerAlarm = useAlarmStore((s) => s.triggerAlarm);
  const members = useCrewStore((s) => s.members);

  const alarm = getAlarm(route.params.alarmId);
  const [snoozesLeft, setSnoozesLeft] = useState(alarm?.maxSnoozes ?? 0);
  const [clock, setClock] = useState(currentClock());
  const [elapsedSec, setElapsedSec] = useState(0);
  const lateNotified = useRef(false);

  const message = useMemo(() => HYPE[Math.floor(Math.random() * HYPE.length)], []);
  const pulse = useSharedValue(1);

  // Assure un timestamp de départ même si on arrive sans triggerAlarm préalable.
  useEffect(() => {
    if (!ringingStartedAt && alarm) triggerAlarm(alarm.id);
  }, [ringingStartedAt, alarm, triggerAlarm]);

  // Statut Crew : alarm_ringing dès l'ouverture.
  useEffect(() => {
    if (alarm) void publishAlarmStatus(alarm, 'alarm_ringing');
  }, [alarm]);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 900 }), -1, true);
    const tick = setInterval(() => setClock(currentClock()), 1000);
    const buzz = setInterval(() => haptics.impact('heavy'), 1500);
    const elapsed = setInterval(() => {
      const start = useAlarmStore.getState().ringingStartedAt ?? Date.now();
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => {
      clearInterval(tick);
      clearInterval(buzz);
      clearInterval(elapsed);
    };
  }, [pulse]);

  // Détection du retard : au-delà de l'heure + délai Wake Blast → statut late.
  useEffect(() => {
    if (!alarm || lateNotified.current) return;
    const lateMin = Math.floor(elapsedSec / 60);
    if (lateMin >= alarm.wakeBlastDelayMin) {
      lateNotified.current = true;
      void publishAlarmStatus(alarm, 'late', { lateMinutes: lateMin });
    }
  }, [elapsedSec, alarm]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  if (!alarm) return null;
  const mission = MissionEngine.get(alarm.missionType);

  const startMission = () => {
    haptics.impact('medium');
    void publishAlarmStatus(alarm, 'mission_in_progress');
    nav.replace('MissionExecution', { alarmId: alarm.id });
  };

  const snooze = () => {
    if (snoozesLeft <= 0) return;
    haptics.warning();
    const used = (alarm.maxSnoozes ?? 0) - snoozesLeft + 1;
    setSnoozesLeft((n) => n - 1);
    void logSnooze(alarm, used);
    dismissAlarm();
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient colors={['#2A1840', t.colors.background]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', marginTop: 12, gap: 8 }}>
            <Text variant="caption" color="accent">
              {alarm.label?.toUpperCase()}
            </Text>
            <Badge label={`${DIFFICULTY_LABEL[alarm.difficulty]} · debout depuis ${formatElapsed(elapsedSec)}`} tone={DIFFICULTY_TONE[alarm.difficulty]} />
          </View>

          <Animated.View style={[{ alignItems: 'center' }, pulseStyle]}>
            <Text variant="clock" style={{ fontSize: 92 }}>
              {clock}
            </Text>
            <Text variant="h3" color="secondary" center style={{ marginTop: 8 }}>
              {message}
            </Text>
          </Animated.View>

          {alarm.crewId && (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text variant="micro" color="tertiary">
                TON CREW EST RÉVEILLÉ
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {members.slice(0, 5).map((m) => (
                  <Avatar key={m.userId} name={m.username} size={40} status={m.status} style={{ marginLeft: -8 }} />
                ))}
              </View>
            </View>
          )}

          <View style={{ gap: 12, paddingBottom: 12 }}>
            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.lg,
                padding: t.spacing.lg,
                borderWidth: 1,
                borderColor: t.colors.glassBorder,
              }}
            >
              <Text variant="micro" color="accent">
                MISSION
              </Text>
              <Text variant="h3">{mission.meta.title}</Text>
              <Text variant="caption" color="secondary">
                {mission.describe(alarm.missionConfig as never)}
              </Text>
            </View>

            <Button label="Commencer la mission" onPress={startMission} />
            {alarm.snoozeAllowed && snoozesLeft > 0 ? (
              <Button label={`Snooze (${snoozesLeft} restant)`} variant="glass" onPress={snooze} />
            ) : (
              <Text variant="caption" color="tertiary" center>
                {alarm.difficulty === 'hardcore'
                  ? 'Mode Hardcore — aucun snooze, aucune pitié.'
                  : 'Plus de snooze. Faut y aller.'}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function currentClock() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m${String(s).padStart(2, '0')}` : `${s}s`;
}
