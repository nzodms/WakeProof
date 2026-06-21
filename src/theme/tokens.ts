// Espacements, rayons, ombres, typographie — tokens du design system.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

// Typographie premium. Sur device on chargera SF Pro / Inter ;
// fallback système par défaut pour le MVP.
export const typography = {
  display: { fontSize: 56, fontWeight: '700', letterSpacing: -1.5 },
  h1: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: 0 },
  bodyStrong: { fontSize: 16, fontWeight: '600', letterSpacing: 0 },
  caption: { fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },
  micro: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  clock: { fontSize: 84, fontWeight: '200', letterSpacing: -2 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.30,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
} as const;

export const timing = {
  fast: 160,
  base: 240,
  slow: 420,
} as const;
