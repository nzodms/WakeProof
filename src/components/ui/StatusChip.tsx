import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type ChipTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface StatusChipProps {
  label: string;
  tone?: ChipTone;
  dot?: boolean;
}

/** Petite pastille de statut (avec point coloré), DA iOS. */
export function StatusChip({ label, tone = 'neutral', dot = true }: StatusChipProps) {
  const t = useTheme();
  const colorMap: Record<ChipTone, string> = {
    neutral: t.colors.textSecondary,
    accent: t.colors.accent,
    success: t.colors.success,
    warning: t.colors.warning,
    danger: t.colors.danger,
  };
  const c = colorMap[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: tone === 'neutral' ? t.colors.surfaceSoft : `${c}1F`,
      }}
    >
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />}
      <Text variant="micro" style={{ color: c, letterSpacing: 0.2 }}>
        {label}
      </Text>
    </View>
  );
}
