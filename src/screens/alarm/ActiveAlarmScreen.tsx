import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useCrewStore } from '@/store/useCrewStore';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { RootStackParamList } from '@/navigation/types';

const HYPE = [
  'Debout. Le lit, c’est fini.',
  'Tes potes te regardent. Fais pas le mort.',
  'Une mission te sépare de ta journée.',
  '1 % de discipline > 100 % de motivation.',
];

export function ActiveAlarmScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ActiveAlarm'>>();
  const { getAlarm, dismissAlarm } = useAlarmStore();
  const members = useCrewStore((s) => s.members);

  const alarm = getAlarm(route.params.alarmId);
  const [snoozesLeft, setSnoozesLeft] = useState(alarm?.maxSnoozes ?? 0);
  const [clock, setClock] = useState(currentClock());

  const message = useMemo(() => HYPE[Math.floor(Math.random() * HYPE.length)], []);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 900 }), -1, true);
    const tick = setInterval(() => setClock(currentClock()), 1000);
    const buzz = setInterval(() => haptics.impact('heavy'), 1500);
    return () => {
      clearInterval(tick);
      clearInterval(buzz);
    };
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  if (!alarm) return null;
  const mission = MissionEngine.get(alarm.missionType);

  const startMission = () => {
    haptics.impact('medium');
    nav.replace('MissionExecution', { alarmId: alarm.id });
  };

  const snooze = () => {
    if (snoozesLeft <= 0) return;
    haptics.warning();
    setSnoozesLeft((n) => n - 1);
    dismissAlarm();
    nav.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient colors={['#2A1840', t.colors.background]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Text variant="caption" color="accent">
              {alarm.label?.toUpperCase()}
            </Text>
          </View>

          <Animated.View style={[{ alignItems: 'center' }, pulseStyle]}>
            <Text variant="clock" style={{ fontSize: 92 }}>
              {clock}
            </Text>
            <Text variant="h3" color="secondary" center style={{ marginTop: 8 }}>
              {message}
            </Text>
          </Animated.View>

          {/* Crew live si l'alarme est liée à un groupe */}
          {alarm.crewId && (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text variant="micro" color="tertiary">
                TON CREW EST RÉVEILLÉ
              </Text>
              <View style={{ flexDirection: 'row', gap: -8 }}>
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
