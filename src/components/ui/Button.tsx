import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const inner = loading ? (
    <ActivityIndicator color={variant === 'primary' ? '#fff' : t.colors.accent} />
  ) : (
    <Text variant="bodyStrong" color={variant === 'primary' || variant === 'danger' ? 'primary' : 'primary'}>
      {label}
    </Text>
  );

  const base: ViewStyle = {
    height: 54,
    borderRadius: t.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xl,
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      {variant === 'primary' && (
        <LinearGradient
          colors={[t.colors.accent, t.isDark ? '#5648D9' : '#7C6BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[base, t.shadows.soft, { shadowColor: t.colors.accent }]}
        >
          {inner}
        </LinearGradient>
      )}
      {variant === 'danger' && (
        <LinearGradient
          colors={[t.colors.danger, '#C81E4E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[base, t.shadows.soft, { shadowColor: t.colors.danger }]}
        >
          {inner}
        </LinearGradient>
      )}
      {variant === 'glass' && (
        <BlurView
          intensity={30}
          tint={t.isDark ? 'dark' : 'light'}
          style={[base, styles.glass, { borderColor: t.colors.glassBorder }]}
        >
          {inner}
        </BlurView>
      )}
      {variant === 'ghost' && (
        <Text variant="bodyStrong" color="accent" style={{ textAlign: 'center', paddingVertical: 16 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glass: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
