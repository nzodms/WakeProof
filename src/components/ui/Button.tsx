import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Text } from './Text';

type Variant = 'primary' | 'glass' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}

/** Bouton iOS : remplissage plat, coins arrondis doux, hauteur 50. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
  style,
  haptic = true,
}: ButtonProps) {
  const t = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) haptics.impact('medium');
    onPress?.();
  };

  const filled = variant === 'primary' || variant === 'danger';
  const fillColor = variant === 'danger' ? t.colors.danger : t.colors.accent;

  const inner = loading ? (
    <ActivityIndicator color={filled ? '#fff' : t.colors.accent} />
  ) : (
    <Text variant="bodyStrong" style={{ color: filled ? '#fff' : t.colors.accent }}>
      {label}
    </Text>
  );

  const base: ViewStyle = {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xl,
    opacity: disabled ? 0.4 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}
    >
      {filled && (
        <View style={[base, t.shadows.soft, { backgroundColor: fillColor, shadowColor: fillColor }]}>{inner}</View>
      )}
      {variant === 'glass' && (
        <BlurView
          intensity={24}
          tint={t.isDark ? 'dark' : 'light'}
          style={[base, styles.glass, { borderColor: t.colors.glassBorder, backgroundColor: t.colors.glass }]}
        >
          {inner}
        </BlurView>
      )}
      {variant === 'ghost' && (
        <View style={[base, { height: 44 }]}>
          <Text variant="bodyStrong" color="accent">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glass: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
