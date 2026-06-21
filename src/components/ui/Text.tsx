import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { TypographyVariant } from '@/theme/tokens';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'danger' | 'warning';
  center?: boolean;
}

export function Text({ variant = 'body', color = 'primary', center, style, ...rest }: TextProps) {
  const t = useTheme();
  const colorMap: Record<NonNullable<TextProps['color']>, string> = {
    primary: t.colors.text,
    secondary: t.colors.textSecondary,
    tertiary: t.colors.textTertiary,
    accent: t.colors.accent,
    success: t.colors.success,
    danger: t.colors.danger,
    warning: t.colors.warning,
  };

  return (
    <RNText
      style={[
        t.typography[variant] as TextStyle,
        { color: colorMap[color] },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
