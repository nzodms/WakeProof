import { Platform } from 'react-native';
import type { Theme } from '@/theme';

/**
 * Profondeur néomorphique iOS 26 sur le WEB (react-native-web).
 * On rend de vraies doubles ombres (claire + sombre) via des attributs
 * `data-neo` ciblés par un CSS injecté une seule fois. Les couleurs viennent
 * de variables CSS mises à jour selon le thème → switch clair/sombre instantané.
 * Sur natif, ces props sont ignorées (le Card applique une ombre RN classique).
 */

const STYLE_ID = 'wp-neo-style';

const CSS = `
:root{
  --neo-dark: rgba(146,158,178,0.40);
  --neo-light: rgba(255,255,255,0.9);
  --neo-line: rgba(255,255,255,0.6);
  --neo-glass: rgba(255,255,255,0.55);
  --neo-glass-border: rgba(255,255,255,0.7);
}
[data-neo]{ position:relative; }
[data-neo="raised"]{
  box-shadow: 7px 7px 18px var(--neo-dark), -7px -7px 18px var(--neo-light);
}
[data-neo="raised-strong"]{
  box-shadow: 12px 12px 30px var(--neo-dark), -10px -10px 26px var(--neo-light);
}
[data-neo="raised-sm"]{
  box-shadow: 5px 5px 12px var(--neo-dark), -5px -5px 12px var(--neo-light);
}
[data-neo="inset"]{
  box-shadow: inset 6px 6px 14px var(--neo-dark), inset -6px -6px 14px var(--neo-light);
}
[data-neo="pill"]{
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 8px 8px 20px var(--neo-dark), -7px -7px 18px var(--neo-light);
}
[data-pressable]{ transition: transform .16s cubic-bezier(.2,.9,.3,1), box-shadow .2s ease; }
[data-pressable]:active{ transform: scale(.985); }
`;

export function injectNeoStyles(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.innerHTML = CSS;
  document.head.appendChild(style);
}

export function applyNeoVars(theme: Theme): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const root = document.documentElement.style;
  root.setProperty('--neo-dark', theme.colors.shadowDark);
  root.setProperty('--neo-light', theme.colors.shadowLight);
  root.setProperty('--neo-line', theme.colors.glassBorder);
  root.setProperty('--neo-glass', theme.colors.glass);
  root.setProperty('--neo-glass-border', theme.colors.glassBorder);
}

export type NeoVariant = 'raised' | 'raised-strong' | 'raised-sm' | 'inset' | 'pill';

/** Props à étaler sur une View pour la profondeur web (no-op sur natif). */
export function neo(variant: NeoVariant, pressable = false) {
  if (Platform.OS !== 'web') return {};
  return { dataSet: pressable ? { neo: variant, pressable: 'true' } : { neo: variant } };
}
