import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const t = useTheme();
  const map: Record<Tone, { bg: string; fg: BadgeColor }> = {
    neutral: { bg: t.colors.glass, fg: 'secondary' },
    accent: { bg: t.colors.accentSoft, fg: 'accent' },
    success: { bg: 'rgba(52,211,153,0.16)', fg: 'success' },
    warning: { bg: 'rgba(251,191,36,0.16)', fg: 'warning' },
    danger: { bg: 'rgba(251,113,133,0.16)', fg: 'danger' },
  };
  const conf = map[tone];

  return (
    <View
      style={[
        {
          backgroundColor: conf.bg,
          paddingHorizontal: t.spacing.md,
          paddingVertical: 5,
          borderRadius: t.radius.pill,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="micro" color={conf.fg}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

type BadgeColor = 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
