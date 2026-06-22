import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from './Button';
import { Text } from './Text';
import { useTheme } from '@/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** État vide premium réutilisable (pas de liste = invitation à l'action). */
export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const t = useTheme();
  return (
    <GlassCard radiusKey="xl" style={{ marginTop: t.spacing.lg }}>
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: t.spacing.lg }}>
        <Text style={{ fontSize: 44 }}>{emoji}</Text>
        <Text variant="h3" center>
          {title}
        </Text>
        <Text variant="caption" color="secondary" center style={{ marginBottom: actionLabel ? 8 : 0 }}>
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
