import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import { isLive, RUNTIME_LABEL } from '@/lib/runtimeMode';

/**
 * Pastille discrète indiquant le mode (DEMO / LIVE) pour le dev.
 * Visible uniquement en build de développement.
 */
export function RuntimeBadge() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  if (!__DEV__) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + 6,
        alignSelf: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: isLive ? 'rgba(52,211,153,0.18)' : t.colors.glass,
        borderWidth: 1,
        borderColor: t.colors.glassBorder,
      }}
    >
      <Text variant="micro" color={isLive ? 'success' : 'tertiary'}>
        {RUNTIME_LABEL}
      </Text>
    </View>
  );
}
