import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from './Button';
import { Text } from './Text';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  /** @deprecated utiliser icon (Ionicons). Conservé pour compat. */
  emoji?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** État vide premium réutilisable (icône Ionicons, pas d'emoji UI). */
export function EmptyState({ icon = 'alarm-outline', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const t = useTheme();
  return (
    <GlassCard variant="raised-strong" radiusKey="xl" style={{ marginTop: 16 }}>
      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 16 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            backgroundColor: t.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={30} color={t.colors.accent} />
        </View>
        <Text variant="h3" center>
          {title}
        </Text>
        <Text variant="caption" color="secondary" center style={{ marginBottom: actionLabel ? 8 : 0, paddingHorizontal: 8 }}>
          {subtitle}
        </Text>
        {actionLabel && onAction && (
          <View style={{ width: '100%', marginTop: 4 }}>
            <Button label={actionLabel} onPress={onAction} />
          </View>
        )}
      </View>
    </GlassCard>
  );
}
