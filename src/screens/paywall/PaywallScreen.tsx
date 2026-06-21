import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/glass/GlassCard';
import { ModalHeader } from '@/components/ui/ModalHeader';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { useEntitlementsStore } from '@/store/useEntitlementsStore';
import { PREMIUM_FEATURES } from '@/constants/premium';

type Plan = 'yearly' | 'monthly';

export function PaywallScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const setPremium = useEntitlementsStore((s) => s.setPremium);
  const [plan, setPlan] = useState<Plan>('yearly');

  const subscribe = () => {
    haptics.success();
    // TODO RevenueCat: await Purchases.purchasePackage(pkg)
    setPremium(true);
    nav.goBack();
  };

  return (
    <Screen scroll withHalos>
      <ModalHeader title="" />
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 44 }}>👑</Text>
        <Text variant="display" center style={{ fontSize: 38 }}>
          WakeProof Premium
        </Text>
        <Text variant="body" color="secondary" center>
          Le réveil social, sans limites.
        </Text>
      </View>

      <GlassCard radiusKey="xl" style={{ marginTop: t.spacing.xl }}>
        {PREMIUM_FEATURES.map((f, i) => (
          <View key={f.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: 10 }}>
              <Icon name="check" size={20} color={t.colors.success} />
              <Text variant="body" style={{ flex: 1 }}>
                {f.label}
              </Text>
              <Text variant="caption" color="accent">
                {f.premium}
              </Text>
            </View>
            {i < PREMIUM_FEATURES.length - 1 && <View style={{ height: 1, backgroundColor: t.colors.glassBorder }} />}
          </View>
        ))}
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: t.spacing.xl }}>
        <PlanCard
          active={plan === 'yearly'}
          onPress={() => setPlan('yearly')}
          title="Annuel"
          price="39,99 €"
          sub="3,33 €/mois · -45%"
          badge="POPULAIRE"
        />
        <PlanCard
          active={plan === 'monthly'}
          onPress={() => setPlan('monthly')}
          title="Mensuel"
          price="5,99 €"
          sub="par mois"
        />
      </View>

      <View style={{ marginTop: t.spacing.xl, gap: t.spacing.sm }}>
        <Button label="Commencer l’essai de 7 jours" onPress={subscribe} />
        <Text variant="caption" color="tertiary" center>
          Annulable à tout moment · puis {plan === 'yearly' ? '39,99 €/an' : '5,99 €/mois'}
        </Text>
      </View>
    </Screen>
  );
}

function PlanCard({
  active,
  onPress,
  title,
  price,
  sub,
  badge,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  price: string;
  sub: string;
  badge?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
    >
      <GlassCard glow={active} style={active ? { borderColor: t.colors.accent } : undefined}>
        {badge && (
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <Text variant="micro" color="accent">
              {badge}
            </Text>
          </View>
        )}
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="h2" style={{ marginTop: 6 }}>
          {price}
        </Text>
        <Text variant="caption" color="secondary">
          {sub}
        </Text>
      </GlassCard>
    </Pressable>
  );
}
