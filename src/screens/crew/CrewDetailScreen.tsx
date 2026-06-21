import React, { useState } from 'react';
import { View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Avatar } from '@/components/ui/Avatar';
import { ShareCard } from '@/components/social/ShareCard';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useCrewStore } from '@/store/useCrewStore';
import { DEMO_LEADERBOARD } from '@/constants/demoData';
import { RootStackParamList } from '@/navigation/types';

type Period = 'daily' | 'weekly' | 'monthly';

export function CrewDetailScreen() {
  const t = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'CrewDetail'>>();
  const { crews } = useCrewStore();
  const crew = crews.find((c) => c.id === route.params.crewId) ?? crews[0];
  const [period, setPeriod] = useState<Period>('weekly');
  const [showShare, setShowShare] = useState(false);

  return (
    <Screen scroll>
      <ModalHeader title={crew?.name ?? 'Crew'} />

      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text variant="caption" color="secondary">
              Code d’invitation
            </Text>
            <Text variant="h2" color="accent">
              {crew?.inviteCode}
            </Text>
          </View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              backgroundColor: t.colors.glass,
              borderWidth: 1,
              borderColor: t.colors.glassBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>🔳</Text>
          </View>
        </View>
        <Text variant="caption" color="tertiary" style={{ marginTop: 8 }}>
          Partage le code ou le QR pour inviter tes potes.
        </Text>
      </GlassCard>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Classement
      </Text>
      <SegmentedControl
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'daily', label: 'Jour' },
          { value: 'weekly', label: 'Semaine' },
          { value: 'monthly', label: 'Mois' },
        ]}
      />
      <View style={{ gap: t.spacing.sm, marginTop: t.spacing.md }}>
        {DEMO_LEADERBOARD.map((row) => (
          <GlassCard key={row.rank}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
              <Text variant="h3" color={row.rank <= 3 ? 'accent' : 'tertiary'} style={{ width: 28 }}>
                {row.rank}
              </Text>
              <Avatar name={row.username} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{row.username}</Text>
                <Text variant="caption" color="secondary">
                  🔥 {row.streak} jours de streak
                </Text>
              </View>
              <Text variant="h3" color="accent">
                {row.score}
              </Text>
            </View>
          </GlassCard>
        ))}
      </View>

      {/* Hall of Fame / Shame */}
      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
        <GlassCard style={{ flex: 1 }} glow>
          <Text variant="micro" color="success">
            HALL OF FAME 🏆
          </Text>
          <HallRow label="Meilleur streak" value="Hugo · 14j" />
          <HallRow label="Zéro snooze" value="Lucas" />
          <HallRow label="Mission hardcore" value="Enzo" />
        </GlassCard>
        <GlassCard style={{ flex: 1 }}>
          <Text variant="micro" color="danger">
            HALL OF SHAME 💀
          </Text>
          <HallRow label="Plus gros snoozer" value="Max · 4" />
          <HallRow label="Plus gros retard" value="Hugo · 12min" />
          <HallRow label="Réveil fantôme" value="—" />
        </GlassCard>
      </View>
      <Text variant="caption" color="tertiary" style={{ marginTop: 8 }}>
        Le Hall of Shame reste fun et désactivable dans les réglages de confidentialité.
      </Text>

      <Text variant="h3" style={{ marginTop: t.spacing.xl, marginBottom: t.spacing.sm }}>
        Partage viral
      </Text>
      {showShare ? (
        <ShareCard
          title={`${crew?.name} — Rapport du matin`}
          subtitle="Rapport du matin"
          rows={[
            { username: 'Enzo', line: 'réveillé à 7h03', emoji: '✅' },
            { username: 'Lucas', line: '0 snooze', emoji: '🔥' },
            { username: 'Max', line: '4 snoozes + Wake Blast reçu', emoji: '💀' },
            { username: 'Hugo', line: 'vainqueur du jour', emoji: '👑' },
          ]}
        />
      ) : (
        <Button
          label="Générer la carte story"
          variant="glass"
          onPress={() => {
            haptics.impact('medium');
            setShowShare(true);
          }}
        />
      )}
      {showShare && (
        <View style={{ marginTop: t.spacing.md }}>
          <Button label="Partager en story" onPress={() => haptics.success()} />
        </View>
      )}
    </Screen>
  );
}

function HallRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}
