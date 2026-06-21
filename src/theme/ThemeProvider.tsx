import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, Palette, palettes } from './colors';
import { radius, shadows, spacing, timing, typography } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  timing: typeof timing;
  isDark: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  override: ColorScheme | 'system';
  setOverride: (o: ColorScheme | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ColorScheme | 'system'>('system');

  const scheme: ColorScheme =
    override === 'system' ? (system === 'light' ? 'light' : 'dark') : override;

  const theme = useMemo<Theme>(
    () => ({
      scheme,
      colors: palettes[scheme],
      spacing,
      radius,
      typography,
      shadows,
      timing,
      isDark: scheme === 'dark',
    }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, override, setOverride }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within ThemeProvider');
  return { override: ctx.override, setOverride: ctx.setOverride };
}
