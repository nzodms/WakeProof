import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  radiusKey?: 'sm' | 'md' | 'lg' | 'xl';
  /** Halo lumineux subtil derrière la carte */
  glow?: boolean;
  padded?: boolean;
}

/**
 * Carte "Liquid Glass" : blur translucide + bordure highlight + léger reflet
 * en haut. La base réutilisable de tout le design system.
 */
export function GlassCard({
  children,
  style,
  intensity = 28,
  radiusKey = 'lg',
  glow = false,
  padded = true,
}: GlassCardProps) {
  const t = useTheme();
  const borderRadius = t.radius[radiusKey];

  return (
    <View style={[styles.wrapper, glow && { ...t.shadows.soft, shadowColor: t.colors.accent }, style]}>
      <BlurView
        intensity={intensity}
        tint={t.isDark ? 'dark' : 'light'}
        style={[styles.blur, { borderRadius, borderColor: t.colors.glassBorder }]}
      >
        <LinearGradient
          colors={[t.colors.glassHighlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[{ backgroundColor: t.colors.glass }, StyleSheet.absoluteFill]} pointerEvents="none" />
        <View style={padded ? { padding: t.spacing.lg } : undefined}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 22 },
  blur: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
