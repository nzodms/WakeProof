import React from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { neo, NeoVariant } from '@/lib/webNeo';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radiusKey?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: NeoVariant;
  glow?: boolean;
  padded?: boolean;
  onPress?: () => void;
}

/**
 * Surface néomorphique iOS 26. Profondeur réelle (double ombre) sur web,
 * ombre douce + reflet supérieur sur natif. Coins arrondis cohérents.
 */
export function GlassCard({
  children,
  style,
  radiusKey = 'lg',
  variant = 'raised',
  glow = false,
  padded = true,
  onPress,
}: GlassCardProps) {
  const t = useTheme();
  const borderRadius = t.radius[radiusKey];
  const isInset = variant === 'inset';

  // Ombre native (web géré par neo()).
  const nativeShadow =
    Platform.OS === 'web' || isInset
      ? null
      : {
          shadowColor: glow ? t.colors.accent : '#000',
          shadowOpacity: glow ? (t.isDark ? 0.3 : 0.18) : t.isDark ? 0.4 : 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        };

  const content = (
    <>
      {/* Reflet supérieur très doux */}
      {!isInset && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 16,
            right: 16,
            height: 1,
            borderRadius: 1,
            backgroundColor: t.colors.glassHighlight,
            opacity: t.isDark ? 0.25 : 0.7,
          }}
        />
      )}
      <View style={padded ? { padding: 18 } : undefined}>{children}</View>
    </>
  );

  const baseStyle: ViewStyle = {
    borderRadius,
    backgroundColor: isInset ? t.colors.surfaceSoft : t.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.glassBorder,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        {...neo(variant, true)}
        style={({ pressed }) => [
          baseStyle,
          nativeShadow,
          pressed && Platform.OS !== 'web' ? { transform: [{ scale: 0.985 }] } : null,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View {...neo(variant)} style={[baseStyle, nativeShadow, style]}>
      {content}
    </View>
  );
}
