// Espacements, rayons, ombres, typographie — tokens du design system (iOS).

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 30,
  xxxl: 44,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

// Typographie premium, proche de SF Pro. Système par défaut pour le MVP.
export const typography = {
  display: { fontSize: 40, fontWeight: '700', letterSpacing: -0.8 },
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: -0.2 },
  bodyStrong: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  caption: { fontSize: 13, fontWeight: '500', letterSpacing: -0.1 },
  micro: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  clock: { fontSize: 76, fontWeight: '300', letterSpacing: -2 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
} as const;

export const timing = {
  fast: 160,
  base: 240,
  slow: 420,
} as const;
