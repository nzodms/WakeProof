import React, { useMemo } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { formatWeekdays, humanizeDuration, minutesUntil } from '@/lib/format';
import { RootStackParamList } from '@/navigation/types';
import { Alarm } from '@/types/domain';

const DIFFICULTY_TONE = { easy: 'success', strict: 'accent', hardcore: 'danger' } as const;
const DIFFICULTY_LABEL = { easy: 'Facile', strict: 'Strict', hardcore: 'Hardcore' } as const;

export function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { alarms, toggleAlarm, triggerAlarm } = useAlarmStore();
  const canCreateAlarm = useEntitlementsStore((s) => s.canCreateAlarm);

  const nextAlarm = useMemo(() => {
    const active = alarms.filter((a) => a.isActive);
    if (active.length === 0) return null;
    return active.reduce((best, a) =>
      minutesUntil(a.timeLocal) < minutesUntil(best.timeLocal) ? a : best,
    );
  }, [alarms]);

  const handleCreate = () => {
    if (!canCreateAlarm(alarms.length)) {
      nav.navigate('Paywall', { reason: 'alarms' });
      return;
    }
    nav.navigate('CreateAlarm');
  };

  return (
    <Screen scroll tabBarSpacing>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text variant="caption" color="secondary">
            Bonjour 👋
          </Text>
          <Text variant="h1">Tes réveils</Text>
        </View>
        <Pressable
          onPress={handleCreate}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: t.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="plus" size={22} color={t.colors.accent} />
        </Pressable>
      </View>

      {/* Hero : prochaine alarme */}
      {nextAlarm && (
        <Pressable
          style={{ marginTop: t.spacing.lg }}
          onPress={() => triggerAlarm(nextAlarm.id) /* démo : ouvre l'écran alarme */}
        >
          <GlassCard glow radiusKey="xl">
            <Text variant="micro" color="accent">
              PROCHAIN RÉVEIL
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
              <Text variant="clock" style={{ fontSize: 72 }}>
                {nextAlarm.timeLocal}
              </Text>
            </View>
            <Text variant="body" color="secondary">
              {nextAlarm.label} · {humanizeDuration(minutesUntil(nextAlarm.timeLocal))}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: t.spacing.md }}>
              <Badge label={DIFFICULTY_LABEL[nextAlarm.difficulty]} tone={DIFFICULTY_TONE[nextAlarm.difficulty]} />
              <Badge label={MissionEngine.get(nextAlarm.missionType).meta.title} tone="neutral" />
              {nextAlarm.wakeBlastEnabled && <Badge label="Wake Blast" tone="warning" />}
            </View>
            <Text variant="caption" color="tertiary" style={{ marginTop: t.spacing.md }}>
              Touche pour simuler la sonnerie (démo)
            </Text>
          </GlassCard>
        </Pressable>
      )}

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Toutes les alarmes
      </Text>
      <View style={{ gap: t.spacing.md }}>
        {alarms.map((alarm) => (
          <AlarmRow
            key={alarm.id}
            alarm={alarm}
            onToggle={() => {
              haptics.selection();
              toggleAlarm(alarm.id);
            }}
            onPress={() => nav.navigate('CreateAlarm', { alarmId: alarm.id })}
          />
        ))}
      </View>
    </Screen>
  );
}

function AlarmRow({ alarm, onToggle, onPress }: { alarm: Alarm; onToggle: () => void; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress}>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, opacity: alarm.isActive ? 1 : 0.5 }}>
            <Text variant="h2" style={{ fontSize: 34, fontWeight: '300' }}>
              {alarm.timeLocal}
            </Text>
            <Text variant="caption" color="secondary">
              {alarm.label} · {formatWeekdays(alarm.weekdays)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <Badge label={DIFFICULTY_LABEL[alarm.difficulty]} tone={DIFFICULTY_TONE[alarm.difficulty]} />
              {!alarm.snoozeAllowed && <Badge label="No snooze" tone="neutral" />}
            </View>
          </View>
          <Switch
            value={alarm.isActive}
            onValueChange={onToggle}
            trackColor={{ true: t.colors.accent, false: t.colors.glassBorder }}
            thumbColor="#fff"
          />
        </View>
      </GlassCard>
    </Pressable>
  );
}
