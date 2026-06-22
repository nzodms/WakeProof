import React, { useMemo } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { useCrewStore } from '@/store/useCrewStore';
import { toggleAlarm as toggleAlarmManaged } from '@/features/alarms/alarmManager';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { formatWeekdays, humanizeDuration, minutesUntil } from '@/lib/format';
import { RootStackParamList } from '@/navigation/types';
import { Alarm } from '@/types/domain';

const DIFFICULTY = {
  easy: { label: 'Facile', color: '#34C759' },
  strict: { label: 'Strict', color: '#007AFF' },
  hardcore: { label: 'Hardcore', color: '#FF3B30' },
} as const;

export function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const alarms = useAlarmStore((s) => s.alarms);
  const triggerAlarm = useAlarmStore((s) => s.triggerAlarm);
  const canCreateAlarm = useEntitlementsStore((s) => s.canCreateAlarm);
  const crews = useCrewStore((s) => s.crews);

  const nextAlarm = useMemo(() => {
    const active = alarms.filter((a) => a.isActive);
    if (active.length === 0) return null;
    return active.reduce((best, a) => (minutesUntil(a.timeLocal) < minutesUntil(best.timeLocal) ? a : best));
  }, [alarms]);

  const handleCreate = () => {
    if (!canCreateAlarm(alarms.length)) {
      nav.navigate('Paywall', { reason: 'alarms' });
      return;
    }
    nav.navigate('CreateAlarm');
  };

  const fab = (
    <Pressable
      onPress={handleCreate}
      style={({ pressed }) => [
        {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: t.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        t.shadows.floating,
        { shadowColor: t.colors.accent },
      ]}
    >
      <Ionicons name="add" size={30} color="#fff" />
    </Pressable>
  );

  return (
    <Screen scroll tabBarSpacing floating={fab}>
      <View style={{ marginTop: 4 }}>
        <Text variant="caption" color="secondary">
          Bonjour
        </Text>
        <Text variant="h1">Tes réveils</Text>
      </View>

      {nextAlarm ? (
        <NextAlarmCard
          alarm={nextAlarm}
          crewName={crews.find((c) => c.id === nextAlarm.crewId)?.name}
          onPress={() => triggerAlarm(nextAlarm.id)}
        />
      ) : (
        <EmptyState
          emoji="⏰"
          title="Aucun réveil actif"
          subtitle="Crée ton premier réveil à mission et lève-toi pour de vrai."
          actionLabel="Créer un réveil"
          onAction={handleCreate}
        />
      )}

      {/* Mini statistiques */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <StatCard icon="flame" tint="#FF9500" value="9" label="Série" />
        <StatCard icon="moon" tint="#5E5CE6" value="23" label="Snoozes évités" />
        <StatCard icon="trophy" tint="#FFCC00" value="298" label="Wake Score" />
      </View>

      {alarms.length > 0 && (
        <>
          <Text variant="h3" style={{ marginTop: 24, marginBottom: 10 }}>
            Toutes les alarmes
          </Text>
          <View style={{ gap: 10 }}>
            {alarms.map((alarm) => (
              <AlarmRow
                key={alarm.id}
                alarm={alarm}
                onToggle={() => {
                  haptics.selection();
                  void toggleAlarmManaged(alarm);
                }}
                onPress={() => nav.navigate('CreateAlarm', { alarmId: alarm.id })}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function NextAlarmCard({ alarm, crewName, onPress }: { alarm: Alarm; crewName?: string; onPress: () => void }) {
  const t = useTheme();
  const mission = MissionEngine.get(alarm.missionType);
  const diff = DIFFICULTY[alarm.difficulty];

  return (
    <Pressable onPress={onPress} style={{ marginTop: 16 }}>
      <GlassCard glow radiusKey="xl">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="micro" color="accent">
            PROCHAIN RÉVEIL
          </Text>
          <Text variant="caption" color="secondary">
            {humanizeDuration(minutesUntil(alarm.timeLocal))}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
          <Text variant="clock">{alarm.timeLocal}</Text>
        </View>
        <Text variant="body" color="secondary" style={{ marginTop: -4 }}>
          {alarm.label} · {formatWeekdays(alarm.weekdays)}
        </Text>

        {/* Détails en lignes propres */}
        <View style={{ marginTop: 16, gap: 12 }}>
          <DetailRow icon="checkmark-circle-outline" label="Mission" value={mission.meta.title} />
          <DetailRow icon="speedometer-outline" label="Difficulté" value={diff.label} valueColor={diff.color} />
          {crewName && <DetailRow icon="people-outline" label="Crew" value={crewName} />}
          <DetailRow
            icon="megaphone-outline"
            label="Wake Blast"
            value={alarm.wakeBlastEnabled ? `Activé · +${alarm.wakeBlastDelayMin} min` : 'Désactivé'}
            valueColor={alarm.wakeBlastEnabled ? t.colors.warning : t.colors.textSecondary}
          />
        </View>
      </GlassCard>
    </Pressable>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={18} color={t.colors.textSecondary} />
      <Text variant="body" color="secondary" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="bodyStrong" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  value: string;
  label: string;
}) {
  return (
    <GlassCard style={{ flex: 1 }} padded={false}>
      <View style={{ padding: 14, gap: 6 }}>
        <Ionicons name={icon} size={20} color={tint} />
        <Text variant="h2" style={{ fontSize: 24 }}>
          {value}
        </Text>
        <Text variant="micro" color="secondary" style={{ letterSpacing: 0 }}>
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

function AlarmRow({ alarm, onToggle, onPress }: { alarm: Alarm; onToggle: () => void; onPress: () => void }) {
  const t = useTheme();
  const diff = DIFFICULTY[alarm.difficulty];
  return (
    <Pressable onPress={onPress}>
      <GlassCard padded={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <View style={{ flex: 1, opacity: alarm.isActive ? 1 : 0.45 }}>
            <Text style={{ fontSize: 30, fontWeight: '300', color: t.colors.text, letterSpacing: -1 }}>
              {alarm.timeLocal}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: diff.color }} />
              <Text variant="caption" color="secondary">
                {alarm.label} · {formatWeekdays(alarm.weekdays)}
              </Text>
            </View>
          </View>
          <Switch
            value={alarm.isActive}
            onValueChange={onToggle}
            trackColor={{ true: t.colors.accent, false: t.colors.glassBorder }}
            thumbColor="#fff"
            ios_backgroundColor={t.colors.glassBorder}
          />
        </View>
      </GlassCard>
    </Pressable>
  );
}
