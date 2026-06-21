import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { ONBOARDING_GOALS } from '@/constants/categories';
import { requestNotificationPermission } from '@/lib/notifications';

type Step = 'promise' | 'goal' | 'permissions' | 'crew';
const ORDER: Step[] = ['promise', 'goal', 'permissions', 'crew'];

export function OnboardingScreen() {
  const t = useTheme();
  const [step, setStep] = useState<Step>('promise');
  const { goal, setGoal, setPermission, permissions, complete } = useOnboardingStore();

  const idx = ORDER.indexOf(step);
  const next = () => {
    haptics.impact('light');
    if (idx < ORDER.length - 1) setStep(ORDER[idx + 1]!);
    else complete();
  };

  return (
    <Screen>
      {/* Progress dots */}
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {ORDER.map((s, i) => (
          <View
            key={s}
            style={{
              width: i === idx ? 22 : 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: i <= idx ? t.colors.accent : t.colors.glassBorder,
            }}
          />
        ))}
      </View>

      <Animated.View key={step} entering={FadeIn.duration(280)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
        {step === 'promise' && (
          <View style={{ flex: 1, justifyContent: 'center', gap: t.spacing.lg }}>
            <Text variant="display" style={{ fontSize: 46 }}>
              Le réveil qui te force à te lever.
            </Text>
            <Text variant="body" color="secondary">
              WakeProof ne s’éteint pas tant que tu n’as pas accompli ta mission. Et si tu fais le
              mort, tes potes peuvent t’aider… à leur façon.
            </Text>
          </View>
        )}

        {step === 'goal' && (
          <View style={{ flex: 1, paddingTop: t.spacing.xl, gap: t.spacing.md }}>
            <Text variant="h1">Ton objectif ?</Text>
            <Text variant="body" color="secondary" style={{ marginBottom: 8 }}>
              On adapte tes missions et tes classements.
            </Text>
            {ONBOARDING_GOALS.map((g) => {
              const active = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => {
                    haptics.selection();
                    setGoal(g.id);
                  }}
                >
                  <GlassCard
                    glow={active}
                    style={active ? { borderColor: t.colors.accent } : undefined}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                      <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{g.label}</Text>
                        <Text variant="caption" color="secondary">
                          {g.sub}
                        </Text>
                      </View>
                      {active && <Icon name="check" size={20} color={t.colors.accent} />}
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 'permissions' && (
          <View style={{ flex: 1, paddingTop: t.spacing.xl, gap: t.spacing.md }}>
            <Text variant="h1">Autorisations</Text>
            <Text variant="body" color="secondary" style={{ marginBottom: 8 }}>
              Pour que l’alarme et les missions fonctionnent vraiment.
            </Text>
            <PermissionCard
              emoji="🔔"
              title="Notifications"
              sub="Indispensable pour les alarmes"
              granted={permissions.notifications}
              onPress={async () => {
                const ok = await requestNotificationPermission();
                setPermission('notifications', ok);
              }}
            />
            <PermissionCard
              emoji="📷"
              title="Caméra"
              sub="Photo proof & scan QR"
              granted={permissions.camera}
              onPress={() => setPermission('camera', true)}
            />
            <PermissionCard
              emoji="🏃"
              title="Mouvement"
              sub="Shake, pas, squats"
              granted={permissions.motion}
              onPress={() => setPermission('motion', true)}
            />
          </View>
        )}

        {step === 'crew' && (
          <View style={{ flex: 1, justifyContent: 'center', gap: t.spacing.lg }}>
            <Text style={{ fontSize: 44, textAlign: 'center' }}>👥</Text>
            <Text variant="h1" center>
              Rejoins un Crew
            </Text>
            <Text variant="body" color="secondary" center>
              Le réveil social marche mieux à plusieurs. Crée un groupe avec tes potes ou rejoins-en
              un — classements, Wake Blasts et challenges t’attendent.
            </Text>
          </View>
        )}
      </Animated.View>

      <View style={{ gap: t.spacing.sm, paddingBottom: t.spacing.md }}>
        <Button
          label={step === 'crew' ? 'Commencer' : 'Continuer'}
          onPress={next}
          disabled={step === 'goal' && !goal}
        />
        {step !== 'promise' && step !== 'goal' && (
          <Button label="Plus tard" variant="ghost" onPress={next} haptic={false} />
        )}
      </View>
    </Screen>
  );
}

function PermissionCard({
  emoji,
  title,
  sub,
  granted,
  onPress,
}: {
  emoji: string;
  title: string;
  sub: string;
  granted: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={granted}>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
          <Text style={{ fontSize: 26 }}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{title}</Text>
            <Text variant="caption" color="secondary">
              {sub}
            </Text>
          </View>
          {granted ? (
            <Icon name="check" size={22} color={t.colors.success} />
          ) : (
            <Text variant="caption" color="accent">
              Autoriser
            </Text>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
}
