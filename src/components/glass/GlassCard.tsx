import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radiusKey?: 'sm' | 'md' | 'lg' | 'xl';
  /** Accent doux (ombre colorée légère) pour la carte principale. */
  glow?: boolean;
  padded?: boolean;
}

/**
 * Carte glass subtile, DA iOS : fond translucide léger, bordure très fine,
 * ombre douce. Rayon 24-28, padding ~18. Pas de gros gradient.
 */
export function GlassCard({
  children,
  style,
  intensity = 22,
  radiusKey = 'lg',
  glow = false,
  padded = true,
}: GlassCardProps) {
  const t = useTheme();
  const borderRadius = t.radius[radiusKey];
  const shadow = glow
    ? { ...t.shadows.soft, shadowColor: t.colors.accent, shadowOpacity: t.isDark ? 0.25 : 0.16 }
    : t.shadows.soft;

  return (
    <View style={[{ borderRadius }, shadow, style]}>
      <BlurView
        intensity={intensity}
        tint={t.isDark ? 'dark' : 'light'}
        style={[styles.blur, { borderRadius, borderColor: t.colors.glassBorder }]}
      >
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.glass }]}
          pointerEvents="none"
        />
        {/* Reflet supérieur très léger */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: t.colors.glassHighlight,
            opacity: Platform.OS === 'web' ? 0.6 : 0.4,
          }}
        />
        <View style={padded ? { padding: 18 } : undefined}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
