// WakeProof — Palette Apple/iOS. Clair premium par défaut, dark très propre.
// Bleu système iOS comme accent. Pas de halos violets, pas de couleurs criardes.

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  // Fonds
  background: string;
  backgroundElevated: string;
  surface: string;
  // Verre
  glass: string;
  glassStrong: string;
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
  // Sémantique (couleurs système iOS)
  success: string;
  warning: string;
  danger: string;
  // Dégradés de fond (très subtils)
  gradientStart: string;
  gradientEnd: string;
  // Cadre web (preview iPhone)
  webBackdrop: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    background: '#F2F2F7',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    glass: 'rgba(255,255,255,0.70)',
    glassStrong: 'rgba(255,255,255,0.86)',
    glassBorder: 'rgba(0,0,0,0.06)',
    glassHighlight: 'rgba(255,255,255,0.9)',
    text: '#1C1C1E',
    textSecondary: 'rgba(60,60,67,0.6)',
    textTertiary: 'rgba(60,60,67,0.3)',
    accent: '#007AFF',
    accentSoft: 'rgba(0,122,255,0.12)',
    halo: 'rgba(0,122,255,0.10)',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    gradientStart: '#F7F7FB',
    gradientEnd: '#EFEFF4',
    webBackdrop: '#1A1A1C',
  },
  dark: {
    background: '#000000',
    backgroundElevated: '#1C1C1E',
    surface: '#1C1C1E',
    glass: 'rgba(255,255,255,0.08)',
    glassStrong: 'rgba(255,255,255,0.14)',
    glassBorder: 'rgba(255,255,255,0.12)',
    glassHighlight: 'rgba(255,255,255,0.18)',
    text: '#FFFFFF',
    textSecondary: 'rgba(235,235,245,0.6)',
    textTertiary: 'rgba(235,235,245,0.3)',
    accent: '#0A84FF',
    accentSoft: 'rgba(10,132,255,0.20)',
    halo: 'rgba(10,132,255,0.12)',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453B',
    gradientStart: '#1C1C1E',
    gradientEnd: '#000000',
    webBackdrop: '#0A0A0C',
  },
};
