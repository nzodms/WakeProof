import React, { useMemo } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/StatusChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { useCrewStore } from '@/store/useCrewStore';
import { useAuth } from '@/features/auth/AuthProvider';
import { toggleAlarm as toggleAlarmManaged } from '@/features/alarms/alarmManager';
import { MissionEngine } from '@/features/missions/MissionEngine';
import { formatWeekdays, minutesUntil } from '@/lib/format';
import { RootStackParamList } from '@/navigation/types';
import { Alarm } from '@/types/domain';

const DIFFICULTY = {
  easy: { label: 'Facile', color: '#34C759' },
  strict: { label: 'Strict', color: '#0A84FF' },
  hardcore: { label: 'Hardcore', color: '#FF3B30' },
} as const;

export function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const alarms = useAlarmStore((s) => s.alarms);
  const triggerAlarm = useAlarmStore((s) => s.triggerAlarm);
  const canCreateAlarm = useEntitlementsStore((s) => s.canCreateAlarm);
  const crews = useCrewStore((s) => s.crews);
  const { profile } = useAuth();
  const name = profile?.displayName ?? profile?.username ?? 'Enzo';

  const next = useMemo(() => {
    const active = alarms.filter((a) => a.isActive);
    if (!active.length) return null;
    return active.reduce((b, a) => (minutesUntil(a.timeLocal) < minutesUntil(b.timeLocal) ? a : b));
  }, [alarms]);

  const others = alarms.filter((a) => a.id !== next?.id);

  const handleCreate = () => {
    if (!canCreateAlarm(alarms.length)) return nav.navigate('Paywall', { reason: 'alarms' });
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
          transform: [{ scale: pressed ? 0.94 : 1 }],
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
      <Animated.View entering={FadeInDown.duration(360)} style={{ marginTop: 4 }}>
        <Text variant="caption" color="secondary">
          Bonjour {name}
        </Text>
        <Text variant="h1">Prêt à gagner ton matin ?</Text>
      </Animated.View>

      {next ? (
        <Animated.View entering={FadeInDown.duration(420).delay(80)}>
          <NextAlarmCard
            alarm={next}
            crewName={crews.find((c) => c.id === next.crewId)?.name}
            onTest={() => {
              haptics.impact('heavy');
              triggerAlarm(next.id);
              nav.navigate('ActiveAlarm', { alarmId: next.id });
            }}
            onEdit={() => nav.navigate('CreateAlarm', { alarmId: next.id })}
          />
        </Animated.View>
      ) : (
        <EmptyState
          icon="alarm-outline"
          title="Aucun réveil actif"
          subtitle="Ton lit n’a pas besoin d’une victoire de plus. Crée ton premier réveil."
          actionLabel="Créer un réveil"
          onAction={handleCreate}
        />
      )}

      <Animated.View entering={FadeInDown.duration(420).delay(160)} style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Stat icon="flame" tint="#FF9500" value="9" label="Série" />
        <Stat icon="pulse" tint="#34C759" value="87%" label="Régularité" />
        <Stat icon="moon" tint="#0A84FF" value="23" label="Snoozes évités" />
      </Animated.View>

      {others.length > 0 && (
        <>
          <Text variant="h3" style={{ marginTop: 24, marginBottom: 10 }}>
            Autres réveils
          </Text>
          <View style={{ gap: 10 }}>
            {others.map((a, i) => (
              <Animated.View key={a.id} entering={FadeInDown.duration(360).delay(220 + i * 60)}>
                <CompactAlarm
                  alarm={a}
                  onToggle={() => {
                    haptics.selection();
                    void toggleAlarmManaged(a);
                  }}
                  onPress={() => nav.navigate('CreateAlarm', { alarmId: a.id })}
                />
              </Animated.View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function NextAlarmCard({
  alarm,
  crewName,
  onTest,
  onEdit,
}: {
  alarm: Alarm;
  crewName?: string;
  onTest: () => void;
  onEdit: () => void;
}) {
  const t = useTheme();
  const mission = MissionEngine.get(alarm.missionType);
  const diff = DIFFICULTY[alarm.difficulty];
  const mins = minutesUntil(alarm.timeLocal);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const countdown = h > 0 ? `dans ${h}h${String(m).padStart(2, '0')}` : `dans ${m} min`;

  return (
    <GlassCard variant="raised-strong" radiusKey="xl" style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusChip label="PROCHAIN RÉVEIL" tone="accent" />
        <Text variant="caption" color="secondary">
          {countdown}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <View>
          <Text style={{ fontSize: 64, fontWeight: '200', letterSpacing: -2, color: t.colors.text }}>
            {alarm.timeLocal}
          </Text>
          <Text variant="caption" color="secondary" style={{ marginTop: -2 }}>
            {alarm.label} · {formatWeekdays(alarm.weekdays)}
          </Text>
        </View>
        <Ring progress={1 - Math.min(1, mins / (24 * 60))} color={diff.color} label={diff.label} />
      </View>

      <View style={{ height: 1, backgroundColor: t.colors.glassBorder, marginVertical: 16 }} />

      <View style={{ gap: 12 }}>
        <Row icon="checkmark-circle-outline" label="Mission" value={`${mission.meta.title} · ${mission.describe(alarm.missionConfig as never)}`} />
        {crewName && <Row icon="people-outline" label="Crew" value={`${crewName} surveille ton réveil`} />}
        <Row
          icon="megaphone-outline"
          label="Wake Blast"
          value={alarm.wakeBlastEnabled ? `Disponible après ${alarm.wakeBlastDelayMin} min de retard` : 'Désactivé'}
          tint={alarm.wakeBlastEnabled ? t.colors.warning : undefined}
        />
      </View>

      <Text variant="caption" color="tertiary" style={{ marginTop: 14 }}>
        Réveil protégé par WakeProof. Mission obligatoire au réveil.
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Button label="Modifier" variant="glass" onPress={onEdit} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Tester l’alarme" onPress={onTest} />
        </View>
      </View>
    </GlassCard>
  );
}

function Ring({ progress, color, label }: { progress: number; color: string; label: string }) {
  const t = useTheme();
  const size = 76;
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.colors.glassBorder} strokeWidth={5} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0.05, progress))}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text variant="micro" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function Row({ icon, label, value, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tint?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={icon} size={18} color={tint ?? t.colors.textSecondary} />
      <Text variant="caption" color="secondary" style={{ width: 78 }}>
        {label}
      </Text>
      <Text variant="caption" style={{ flex: 1, color: tint ?? t.colors.text, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}

function Stat({ icon, tint, value, label }: { icon: keyof typeof Ionicons.glyphMap; tint: string; value: string; label: string }) {
  return (
    <GlassCard style={{ flex: 1 }} padded={false}>
      <View style={{ padding: 14, gap: 6 }}>
        <Ionicons name={icon} size={19} color={tint} />
        <Text variant="h2" style={{ fontSize: 22 }}>
          {value}
        </Text>
        <Text variant="micro" color="secondary" style={{ letterSpacing: 0 }}>
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

function CompactAlarm({ alarm, onToggle, onPress }: { alarm: Alarm; onToggle: () => void; onPress: () => void }) {
  const t = useTheme();
  const diff = DIFFICULTY[alarm.difficulty];
  return (
    <GlassCard padded={false} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <View style={{ flex: 1, opacity: alarm.isActive ? 1 : 0.4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: '300', color: t.colors.text, letterSpacing: -0.5 }}>
              {alarm.timeLocal}
            </Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: diff.color }} />
          </View>
          <Text variant="caption" color="secondary">
            {alarm.label} · {formatWeekdays(alarm.weekdays)}
          </Text>
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
  );
}
