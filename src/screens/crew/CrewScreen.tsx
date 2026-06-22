import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { StatusChip, ChipTone } from '@/components/ui/StatusChip';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useCrewStore } from '@/store/useCrewStore';
import { getCurrentUser } from '@/store/useSessionStore';
import { subscribeToCrew } from '@/features/crew/crewRealtime';
import { RootStackParamList } from '@/navigation/types';
import { CrewMemberStatus, WakeStatus } from '@/types/domain';

const STATUS: Record<WakeStatus, { phrase: string; chip: string; tone: ChipTone }> = {
  wake_verified: { phrase: 'a validé son réveil', chip: 'Réveillé', tone: 'success' },
  mission_in_progress: { phrase: 'est en mission', chip: 'En mission', tone: 'accent' },
  alarm_ringing: { phrase: 'son réveil sonne', chip: 'Ça sonne', tone: 'warning' },
  snoozed: { phrase: 'a snoozé… le lit gagne', chip: 'A snoozé', tone: 'warning' },
  late: { phrase: 'est en retard', chip: 'En retard', tone: 'danger' },
  failed: { phrase: 'a abandonné', chip: 'Échec', tone: 'danger' },
  sleeping: { phrase: 'dort encore', chip: 'Dort', tone: 'neutral' },
  wake_blast_received: { phrase: 'vient de se faire blaster', chip: 'Blasté', tone: 'danger' },
};

export function CrewScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { crews, activeCrewId, members, feed, setMembers } = useCrewStore();
  const crew = crews.find((c) => c.id === activeCrewId) ?? crews[0];

  useEffect(() => {
    if (!crew) return;
    const { userId, username, avatarUrl } = getCurrentUser();
    return subscribeToCrew(
      crew.id,
      { userId: userId ?? 'me', username, avatarUrl, status: 'sleeping' },
      { onPresenceSync: (next) => next.length > 0 && setMembers(next) },
    );
  }, [crew, setMembers]);

  const awake = members.filter((m) => m.status === 'wake_verified').length;

  return (
    <Screen scroll tabBarSpacing>
      <Animated.View entering={FadeInDown.duration(360)}>
        <Text variant="h1">{crew?.name ?? 'Mon Crew'}</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
          {members.length} membres · réveil 06:30 · {awake} debout
        </Text>
      </Animated.View>

      {/* Statuts du matin */}
      <Animated.View entering={FadeInDown.duration(420).delay(80)}>
        <GlassCard variant="raised-strong" radiusKey="xl" padded={false} style={{ marginTop: 16 }}>
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text variant="h3">Statuts du matin</Text>
              <StatusChip label="LIVE" tone="success" />
            </View>
            {members.map((m, i) => (
              <MemberRow
                key={m.userId}
                member={m}
                last={i === members.length - 1}
                onBlast={() => nav.navigate('WakeBlast', { targetId: m.userId, crewId: crew?.id ?? '' })}
              />
            ))}
          </View>
        </GlassCard>
      </Animated.View>

      {/* Rapport du matin partageable */}
      <Animated.View entering={FadeInDown.duration(420).delay(160)}>
        <GlassCard onPress={() => crew && nav.navigate('CrewDetail', { crewId: crew.id })} style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="share-outline" size={22} color={t.colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">Rapport du matin</Text>
              <Text variant="caption" color="secondary">
                Carte partageable du Crew · format story
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={t.colors.textTertiary} />
          </View>
        </GlassCard>
      </Animated.View>

      {/* Feed */}
      <Text variant="h3" style={{ marginTop: 24, marginBottom: 10 }}>
        Feed du Crew
      </Text>
      <Animated.View entering={FadeInDown.duration(420).delay(220)}>
        <GlassCard padded={false}>
          <View style={{ paddingHorizontal: 16 }}>
            {feed.map((item, i) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: i < feed.length - 1 ? 1 : 0, borderBottomColor: t.colors.glassBorder }}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                <Text variant="caption" style={{ flex: 1, color: t.colors.text }}>
                  <Text variant="caption" style={{ fontWeight: '700', color: t.colors.text }}>{item.username} </Text>
                  {item.text}
                </Text>
                <Text variant="micro" color="tertiary">{item.time}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    </Screen>
  );
}

function MemberRow({ member, last, onBlast }: { member: CrewMemberStatus; last: boolean; onBlast: () => void }) {
  const t = useTheme();
  const s = STATUS[member.status];
  const isLate = member.status === 'late' || member.status === 'snoozed';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.colors.glassBorder,
      }}
    >
      <Avatar name={member.username} size={42} status={member.status} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{member.username}</Text>
        <Text variant="caption" color="secondary">
          {member.username} {s.phrase}
        </Text>
      </View>
      {isLate ? (
        <Pressable
          onPress={() => { haptics.impact('medium'); onBlast(); }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: `${t.colors.danger}1F`,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Ionicons name="megaphone" size={15} color={t.colors.danger} />
          <Text variant="micro" style={{ color: t.colors.danger }}>BLAST</Text>
        </Pressable>
      ) : (
        <StatusChip label={s.chip} tone={s.tone} />
      )}
    </View>
  );
}
