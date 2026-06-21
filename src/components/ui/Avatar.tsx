import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { WakeStatus } from '@/types/domain';

const STATUS_RING: Partial<Record<WakeStatus, string[]>> = {
  wake_verified: ['#34D399', '#10B981'],
  alarm_ringing: ['#FBBF24', '#F59E0B'],
  mission_in_progress: ['#7C6BFF', '#5648D9'],
  snoozed: ['#FB923C', '#EA580C'],
  late: ['#FB7185', '#E11D48'],
  failed: ['#9CA3AF', '#6B7280'],
};

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  status?: WakeStatus;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 48, status, style }: AvatarProps) {
  const t = useTheme();
  const ring = status ? STATUS_RING[status] : undefined;
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const inner = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text variant="bodyStrong" color="accent">
          {initials}
        </Text>
      )}
    </View>
  );

  if (!ring) return <View style={style}>{inner}</View>;

  return (
    <LinearGradient
      colors={ring}
      style={{
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <View style={{ backgroundColor: t.colors.background, borderRadius: size / 2, padding: 2 }}>
        {inner}
      </View>
    </LinearGradient>
  );
}
