import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SettingRow } from '@/components/ui/SettingRow';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { saveAlarm as persistAlarm } from '@/features/alarms/alarmManager';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { WEEKDAY_SHORT } from '@/lib/format';
import { RootStackParamList } from '@/navigation/types';
import { Alarm, AlarmDifficulty, MissionType } from '@/types/domain';

export function CreateAlarmScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateAlarm'>>();
  const getAlarm = useAlarmStore((s) => s.getAlarm);
  const [saving, setSaving] = useState(false);

  const existing = route.params?.alarmId ? getAlarm(route.params.alarmId) : undefined;

  const [hour, setHour] = useState(existing ? Number(existing.timeLocal.split(':')[0]) : 7);
  const [minute, setMinute] = useState(existing ? Number(existing.timeLocal.split(':')[1]) : 0);
  const [label, setLabel] = useState(existing?.label ?? 'Réveil');
  const [weekdays, setWeekdays] = useState<number[]>(existing?.weekdays ?? [1, 2, 3, 4, 5]);
  const [difficulty, setDifficulty] = useState<AlarmDifficulty>(existing?.difficulty ?? 'strict');
  const [missionType, setMissionType] = useState<MissionType>(existing?.missionType ?? 'calc');
  const [snooze, setSnooze] = useState(existing?.snoozeAllowed ?? false);
  const [wakeBlast, setWakeBlast] = useState(existing?.wakeBlastEnabled ?? false);
  const [blastDelay, setBlastDelay] = useState(existing?.wakeBlastDelayMin ?? 5);

  const toggleDay = (d: number) => {
    haptics.selection();
    setWeekdays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  };

  const save = async () => {
    if (saving) return;
    haptics.success();
    setSaving(true);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const base: Alarm = {
      id: existing?.id ?? `a${Date.now()}`,
      label,
      timeLocal: time,
      weekdays,
      difficulty,
      soundId: existing?.soundId ?? 'default',
      snoozeAllowed: difficulty === 'hardcore' ? false : snooze,
      maxSnoozes: snooze && difficulty !== 'hardcore' ? (difficulty === 'easy' ? 3 : 1) : 0,
      missionType,
      missionConfig:
        existing?.missionType === missionType
          ? existing.missionConfig
          : (MissionEngine.get(missionType).defaultConfig as Record<string, unknown>),
      crewId: existing?.crewId ?? null,
      wakeBlastEnabled: wakeBlast,
      wakeBlastDelayMin: blastDelay,
      gracePeriodMin: existing?.gracePeriodMin ?? (difficulty === 'hardcore' ? 0 : 2),
      isActive: true,
    };
    try {
      await persistAlarm(base);
      nav.goBack();
    } finally {
      setSaving(false);
    }
  };

  const mission = MissionEngine.get(missionType);

  return (
    <Screen scroll edges={['top']}>
      <ModalHeader title={existing ? 'Modifier' : 'Nouveau réveil'} />

      {/* Time picker */}
      <GlassCard radiusKey="xl" style={{ marginTop: t.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: t.spacing.lg }}>
          <Stepper value={hour} max={23} onChange={setHour} />
          <Text variant="clock" style={{ fontSize: 56 }}>
            :
          </Text>
          <Stepper value={minute} max={59} step={5} onChange={setMinute} />
        </View>
      </GlassCard>

      {/* Jours */}
      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Répétition
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {WEEKDAY_SHORT.map((d, i) => {
          const active = weekdays.includes(i);
          return (
            <Pressable
              key={i}
              onPress={() => toggleDay(i)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? t.colors.accent : t.colors.glass,
                borderWidth: active ? 0 : 1,
                borderColor: t.colors.glassBorder,
              }}
            >
              <Text variant="caption" style={{ color: active ? '#fff' : t.colors.textSecondary }}>
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Difficulté */}
      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Difficulté
      </Text>
      <SegmentedControl
        value={difficulty}
        onChange={setDifficulty}
        options={[
          { value: 'easy', label: 'Facile' },
          { value: 'strict', label: 'Strict' },
          { value: 'hardcore', label: 'Hardcore' },
        ]}
      />

      {/* Mission */}
      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Mission obligatoire
      </Text>
      <Pressable onPress={() => nav.navigate('MissionSetup', { missionType })}>
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <Icon name={mission.meta.icon as never} size={22} color={t.colors.accent} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{mission.meta.title}</Text>
              <Text variant="caption" color="secondary">
                {mission.describe(mission.defaultConfig)}
              </Text>
            </View>
            <Icon name="chevron" size={18} color={t.colors.textTertiary} />
          </View>
        </GlassCard>
      </Pressable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.sm }}>
        {MissionEngine.list().map((m) => {
          const active = m.meta.type === missionType;
          return (
            <Pressable
              key={m.meta.type}
              onPress={() => {
                haptics.selection();
                setMissionType(m.meta.type);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? t.colors.accentSoft : t.colors.glass,
                borderWidth: 1,
                borderColor: active ? t.colors.accent : t.colors.glassBorder,
              }}
            >
              <Text variant="caption" color={active ? 'accent' : 'secondary'}>
                {m.meta.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Options */}
      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Options
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg }}>
        <SettingRow
          icon="alarm"
          label="Snooze autorisé"
          description={difficulty === 'hardcore' ? 'Indisponible en Hardcore' : 'Limité selon difficulté'}
          toggle={{ value: difficulty === 'hardcore' ? false : snooze, onChange: setSnooze }}
        />
        <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
        <SettingRow
          icon="bolt"
          label="Wake Blast"
          description="Tes potes peuvent te réveiller si tu es en retard"
          toggle={{ value: wakeBlast, onChange: setWakeBlast }}
        />
        {wakeBlast && (
          <>
            <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />
            <SettingRow
              icon="flame"
              label="Délai avant Wake Blast"
              value={`${blastDelay} min`}
              onPress={() => {
                haptics.selection();
                setBlastDelay((d) => (d === 5 ? 10 : 5));
              }}
            />
          </>
        )}
      </GlassCard>

      <View style={{ marginTop: t.spacing.xl }}>
        <Button label={existing ? 'Enregistrer' : 'Créer le réveil'} onPress={save} loading={saving} />
      </View>
    </Screen>
  );
}

function Stepper({
  value,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const t = useTheme();
  const change = (dir: 1 | -1) => {
    haptics.selection();
    let next = value + dir * step;
    if (next < 0) next = max;
    if (next > max) next = 0;
    onChange(next);
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={() => change(1)} hitSlop={10}>
        <Icon name="chevron" size={22} color={t.colors.textTertiary} strokeWidth={2} />
      </Pressable>
      <Text variant="clock" style={{ fontSize: 64, transform: [{ rotate: '0deg' }] }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Pressable onPress={() => change(-1)} hitSlop={10} style={{ transform: [{ rotate: '180deg' }] }}>
        <Icon name="chevron" size={22} color={t.colors.textTertiary} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
