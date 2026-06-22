// WakeProof — Direction artistique iOS 26 / Liquid Glass néomorphique.
// Fond premium bleu-gris, profondeur douce (double ombre), bleu Apple.
// Couleurs limitées : encre, gris, bleu, vert succès, orange retard, rouge échec.

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  // Fonds
  background: string;
  bgGradA: string;
  bgGradB: string;
  surface: string;
  surfaceSoft: string;
  // Profondeur néomorphique
  shadowLight: string;
  shadowDark: string;
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
  // Cadre web
  webBackdrop: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    background: '#E8ECF2',
    bgGradA: '#EEF2F7',
    bgGradB: '#DCE2EB',
    surface: '#E9EDF3',
    surfaceSoft: 'rgba(233,237,243,0.7)',
    shadowLight: 'rgba(255,255,255,0.9)',
    shadowDark: 'rgba(146,158,178,0.40)',
    glass: 'rgba(255,255,255,0.55)',
    glassBorder: 'rgba(255,255,255,0.7)',
    glassHighlight: 'rgba(255,255,255,0.95)',
    text: '#161A22',
    textSecondary: 'rgba(60,67,80,0.66)',
    textTertiary: 'rgba(60,67,80,0.38)',
    accent: '#0A84FF',
    accentSoft: 'rgba(10,132,255,0.12)',
    halo: 'rgba(10,132,255,0.14)',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    webBackdrop: '#12151C',
  },
  dark: {
    background: '#0E1117',
    bgGradA: '#161B24',
    bgGradB: '#0A0D12',
    surface: '#171C26',
    surfaceSoft: 'rgba(23,28,38,0.7)',
    shadowLight: 'rgba(255,255,255,0.05)',
    shadowDark: 'rgba(0,0,0,0.55)',
    glass: 'rgba(40,46,58,0.5)',
    glassBorder: 'rgba(255,255,255,0.10)',
    glassHighlight: 'rgba(255,255,255,0.14)',
    text: '#F2F4F8',
    textSecondary: 'rgba(225,229,238,0.62)',
    textTertiary: 'rgba(225,229,238,0.34)',
    accent: '#0A84FF',
    accentSoft: 'rgba(10,132,255,0.20)',
    halo: 'rgba(10,132,255,0.18)',
    success: '#30D158',
    warning: '#FF9F0A',
    danger: '#FF453B',
    webBackdrop: '#06080C',
  },
};
