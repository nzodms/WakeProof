import React, { useEffect, useRef } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';

/**
 * Switcher Apple Liquid Glass — version WEB (DOM réel).
 * Reproduit l'effet du CodePen "Apple Liquid glass switcher" (Den Dionigi) :
 *  - capsule translucide `backdrop-filter`,
 *  - filtre SVG de réfraction (displacement) appliqué au verre,
 *  - pastille active qui glisse sous l'icône (sur `.wp-switcher::after`),
 *  - reflets / highlights doux. Pas de labels, pas de trait bleu.
 */

const ROUTES = ['Alarm', 'Missions', 'Crew', 'Leaderboard', 'Profile'];
const COUNT = ROUTES.length;

const BAR_W = 272;
const BAR_H = 56;
const PAD = 6;
const SEG = (BAR_W - PAD * 2) / COUNT;
const PILL = 46;

export function AppleGlassSwitcher({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const dark = t.isDark;
  const styleId = 'wp-switcher-style';
  const index = state.index;

  // Injecte une seule fois le CSS + le filtre SVG de réfraction.
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = CSS;
    document.head.appendChild(style);
    const svg = document.createElement('div');
    svg.innerHTML = SVG_FILTER;
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    document.body.appendChild(svg);
  }, []);

  const pillX = PAD + index * SEG + (SEG - PILL) / 2;

  return (
    <div className="wp-switcher-wrap" aria-hidden={false}>
      <div className={`wp-switcher ${dark ? 'is-dark' : 'is-light'}`}>
        <div className="wp-glass" />
        <div className="wp-sheen" />
        <div
          className="wp-pill"
          style={{ transform: `translateX(${pillX}px)`, width: PILL, height: PILL }}
        />
        <div className="wp-icons">
          {state.routes.map((route, i) => {
            const selected = state.index === i;
            const color = selected
              ? dark
                ? '#FFFFFF'
                : '#0A0A0A'
              : dark
                ? 'rgba(235,235,245,0.55)'
                : 'rgba(60,60,67,0.5)';
            const onPress = () => {
              if (selected) return;
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <button
                key={route.key}
                className="wp-tab"
                onClick={onPress}
                style={{ width: SEG }}
                aria-label={route.name}
              >
                {ICONS[ROUTES[i] ?? 'Profile']?.(color)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Icônes outline (SVG inline, trait fin Apple-like) ----------------------
const ICONS: Record<string, (c: string) => React.ReactNode> = {
  Alarm: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7" stroke={c} strokeWidth="1.7" />
      <path d="M12 10v3.2l2.2 1.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4 2.6 6.2M19 4l2.4 2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  Missions: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.2" stroke={c} strokeWidth="1.7" />
      <path d="M8.4 12.2 11 14.8 15.8 9.4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Crew: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3.1" stroke={c} strokeWidth="1.7" />
      <path d="M3.6 18.4c.7-3 2.8-4.6 5.4-4.6s4.7 1.6 5.4 4.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 7.2a2.4 2.4 0 0 1 0 4.6M17.4 18.4c-.3-2-1.3-3.4-2.8-4.2" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Leaderboard: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 5h10v3.2c0 2.9-1.6 5-3 5s-2.6-2-2.6-5" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 5v3.2c0 1.9 1.1 3.3 2.9 3.7M17 5v3.2c0 1.9-1.1 3.3-2.9 3.7" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13.4v3M9 19h6M10.2 16.2h3.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  Profile: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.3" r="3.4" stroke={c} strokeWidth="1.7" />
      <path d="M5.6 19c.8-3.3 3.2-5 6.4-5s5.6 1.7 6.4 5" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
};

// --- Filtre SVG de réfraction (liquid glass displacement) -------------------
const SVG_FILTER = `
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="wp-liquid" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="7" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="1.4" result="blurred"/>
    <feDisplacementMap in="SourceGraphic" in2="blurred" scale="14" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;

// --- CSS -------------------------------------------------------------------
const CSS = `
.wp-switcher-wrap{
  position:absolute; left:0; right:0; bottom:max(22px, env(safe-area-inset-bottom));
  display:flex; justify-content:center; pointer-events:none; z-index:50;
}
.wp-switcher{
  position:relative; width:${BAR_W}px; height:${BAR_H}px; border-radius:999px;
  padding:${PAD}px; pointer-events:auto; isolation:isolate;
  box-shadow:0 10px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10);
}
.wp-glass{
  position:absolute; inset:0; border-radius:999px; overflow:hidden;
  backdrop-filter:blur(14px) saturate(180%); -webkit-backdrop-filter:blur(14px) saturate(180%);
  filter:url(#wp-liquid);
}
.wp-switcher.is-light .wp-glass{ background:rgba(255,255,255,0.55); }
.wp-switcher.is-dark  .wp-glass{ background:rgba(40,40,44,0.45); }
.wp-switcher.is-light{ border:1px solid rgba(255,255,255,0.75); }
.wp-switcher.is-dark { border:1px solid rgba(255,255,255,0.12); }
.wp-sheen{
  position:absolute; inset:0; border-radius:999px; pointer-events:none;
  background:linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%);
  opacity:.7; mix-blend-mode:screen;
}
.wp-switcher.is-dark .wp-sheen{
  background:linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 50%);
  opacity:.6;
}
.wp-pill{
  position:absolute; top:${(BAR_H - PILL) / 2}px; left:0; border-radius:999px;
  transition:transform .42s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 4px 12px rgba(0,0,0,0.16), inset 0 1px 1px rgba(255,255,255,0.7);
}
.wp-switcher.is-light .wp-pill{
  background:rgba(255,255,255,0.78);
  border:1px solid rgba(255,255,255,0.95);
}
.wp-switcher.is-dark .wp-pill{
  background:rgba(255,255,255,0.16);
  border:1px solid rgba(255,255,255,0.22);
}
.wp-icons{ position:relative; height:100%; display:flex; align-items:center; }
.wp-tab{
  height:100%; background:transparent; border:0; padding:0; margin:0; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  -webkit-tap-highlight-color:transparent;
}
.wp-tab svg{ transition:transform .3s cubic-bezier(.34,1.56,.64,1); }
.wp-tab:active svg{ transform:scale(.9); }
`;
