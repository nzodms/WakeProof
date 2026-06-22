import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useCrewStore } from '@/store/useCrewStore';
import { getCurrentUser } from '@/store/useSessionStore';
import { subscribeToCrew } from '@/features/crew/crewRealtime';
import { WAKE_STATUS_META } from '@/constants/wakeStatus';
import { canSendWakeBlast } from '@/features/wakeBlast/wakeBlast';
import { nowMinutesOfDay } from '@/lib/format';
import { RootStackParamList } from '@/navigation/types';
import { CrewMemberStatus } from '@/types/domain';

export function CrewScreen() {
  const t = useTheme();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { crews, activeCrewId, members, feed, setMembers } = useCrewStore();
  const crew = crews.find((c) => c.id === activeCrewId) ?? crews[0];

  // Realtime V1 : on reçoit les statuts du matin du Crew en direct (live mode).
  useEffect(() => {
    if (!crew) return;
    const { userId, username, avatarUrl } = getCurrentUser();
    const unsub = subscribeToCrew(
      crew.id,
      { userId: userId ?? 'me', username, avatarUrl, status: 'sleeping' },
      { onPresenceSync: (next) => next.length > 0 && setMembers(next) },
    );
    return unsub;
  }, [crew, setMembers]);

  return (
    <Screen scroll tabBarSpacing>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="caption" color="secondary">
            Ton Crew
          </Text>
          <Text variant="h1">{crew?.name ?? 'Mon Crew'}</Text>
        </View>
        <Pressable
          onPress={() => crew && nav.navigate('CrewDetail', { crewId: crew.id })}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: t.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="crew" size={22} color={t.colors.accent} />
        </Pressable>
      </View>

      <Text variant="h3" style={{ marginTop: t.spacing.lg, marginBottom: t.spacing.sm }}>
        Statuts du matin
      </Text>
      <View style={{ gap: t.spacing.sm }}>
        {members.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            onBlast={() => nav.navigate('WakeBlast', { targetId: m.userId, crewId: crew?.id ?? '' })}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.lg }}>
        <View style={{ flex: 1 }}>
          <Button label="Classement" variant="glass" onPress={() => crew && nav.navigate('CrewDetail', { crewId: crew.id })} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Challenges" variant="glass" onPress={() => nav.navigate('Challenges')} />
        </View>
      </View>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Feed du Crew
      </Text>
      <GlassCard padded={false} style={{ paddingHorizontal: t.spacing.lg, paddingVertical: 4 }}>
        {feed.map((item, i) => (
          <View key={item.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md }}>
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="body">
                  <Text variant="bodyStrong">{item.username}</Text> {item.text}
                </Text>
              </View>
              <Text variant="micro" color="tertiary">
                {item.time}
              </Text>
            </View>
            {i < feed.length - 1 && <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />}
          </View>
        ))}
      </GlassCard>
    </Screen>
  );
}

function MemberRow({ member, onBlast }: { member: CrewMemberStatus; onBlast: () => void }) {
  const t = useTheme();
  const meta = WAKE_STATUS_META[member.status];

  // Vérifie côté UI si le Wake Blast est éligible (re-vérifié serveur).
  const blastEligible = canSendWakeBlast({
    allowWakeBlasts: true,
    allowVoiceBlasts: true,
    allowedTone: 'roast',
    blastWindowStart: '06:00',
    blastWindowEnd: '11:00',
    maxBlastsPerMorning: 5,
    blockedUserIds: [],
    targetStatus: member.status,
    targetLateMinutes: member.lateMinutes ?? 0,
    alarmActive: true,
    wakeBlastDelayMin: 5,
    blastsReceivedThisMorning: 0,
    senderId: 'me',
    requestedTone: 'motivation',
    isVoice: false,
    nowMinutesOfDay: nowMinutesOfDay(),
  }).allowed;

  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Avatar name={member.username} size={44} status={member.status} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{member.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={{ fontSize: 13 }}>{meta.emoji}</Text>
            <Badge label={meta.label} tone={meta.tone} />
            {member.snoozeCount ? <Text variant="micro" color="tertiary">{member.snoozeCount} snoozes</Text> : null}
          </View>
        </View>
        {blastEligible && (
          <Pressable
            onPress={() => {
              haptics.impact('medium');
              onBlast();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(251,113,133,0.16)',
            }}
          >
            <Icon name="bolt" size={16} color={t.colors.danger} />
            <Text variant="micro" color="danger">
              BLAST
            </Text>
          </Pressable>
        )}
      </View>
    </GlassCard>
  );
}
