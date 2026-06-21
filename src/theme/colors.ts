// WakeProof — Palette premium, Apple-like. Pas de couleurs criardes.
// Accent : un violet-bleu profond + un cyan électrique discret pour les halos.

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  // Fonds
  background: string;
  backgroundElevated: string;
  surface: string;
  // Verre
  glass: string;
  glassBorder: string;
  glassHighlight: string;
  // Texte
  text: string;
  textSecondary: string;
  textTertiary: string;
  // Accents
  accent: string;
  accentSoft: string;
  halo: string;
  // Sémantique
  success: string;
  warning: string;
  danger: string;
  // Gradients (réveil / hero)
  gradientStart: string;
  gradientEnd: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  dark: {
    background: '#0A0A0F',
    backgroundElevated: '#12121A',
    surface: '#16161F',
    glass: 'rgba(255,255,255,0.06)',
    glassBorder: 'rgba(255,255,255,0.10)',
    glassHighlight: 'rgba(255,255,255,0.18)',
    text: '#F5F5F7',
    textSecondary: 'rgba(245,245,247,0.62)',
    textTertiary: 'rgba(245,245,247,0.38)',
    accent: '#7C6BFF',
    accentSoft: 'rgba(124,107,255,0.16)',
    halo: 'rgba(94,234,255,0.40)',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#FB7185',
    gradientStart: '#1A1530',
    gradientEnd: '#0A0A0F',
  },
  light: {
    background: '#F4F4F7',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    glass: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.70)',
    glassHighlight: 'rgba(255,255,255,0.90)',
    text: '#0B0B12',
    textSecondary: 'rgba(11,11,18,0.58)',
    textTertiary: 'rgba(11,11,18,0.34)',
    accent: '#5B4BE0',
    accentSoft: 'rgba(91,75,224,0.12)',
    halo: 'rgba(64,196,224,0.35)',
    success: '#059669',
    warning: '#D97706',
    danger: '#E11D48',
    gradientStart: '#E9E6FF',
    gradientEnd: '#F4F4F7',
  },
};
