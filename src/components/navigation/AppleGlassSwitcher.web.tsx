import React, { useEffect } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';

/**
 * Switcher Apple Liquid Glass — version WEB (DOM réel), inspirée du CodePen
 * "Apple Liquid glass switcher" (Den Dionigi) + démo iOS 26 néomorphique :
 *  - capsule translucide à profondeur douce (double ombre néomorphique),
 *  - pastille active "verre" qui glisse avec reflet interne et ombre douce,
 *  - léger glow radial qui suit l'onglet actif,
 *  - icônes fines, pas de labels, aucun bleu de focus.
 */

const ORDER = ['Alarm', 'Missions', 'Crew', 'Leaderboard', 'Profile'] as const;
const COUNT = 5;
const BAR_W = 274;
const BAR_H = 58;
const PAD = 6;
const SEG = (BAR_W - PAD * 2) / COUNT;
const PILL = 46;
const STYLE_ID = 'wp-switcher-style';

export function AppleGlassSwitcher({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const dark = t.isDark;
  const index = state.index;

  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML = CSS;
    document.head.appendChild(style);
    const holder = document.createElement('div');
    holder.innerHTML = SVG_FILTER;
    holder.style.cssText = 'position:absolute;width:0;height:0;';
    document.body.appendChild(holder);
  }, []);

  const pillX = PAD + index * SEG + (SEG - PILL) / 2;
  const glowX = PAD + index * SEG + SEG / 2;

  return (
    <div className="wpsw-wrap">
      <div className={`wpsw ${dark ? 'is-dark' : 'is-light'}`}>
        <div className="wpsw-glass" />
        <div className="wpsw-glow" style={{ left: glowX }} />
        <div className="wpsw-pill" style={{ transform: `translateX(${pillX}px)`, width: PILL, height: PILL }} />
        <div className="wpsw-row">
          {state.routes.map((route, i) => {
            const selected = state.index === i;
            const color = selected
              ? dark
                ? '#FFFFFF'
                : '#13161D'
              : dark
                ? 'rgba(225,229,238,0.5)'
                : 'rgba(60,67,80,0.45)';
            const onPress = () => {
              if (selected) return;
              const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!ev.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <button key={route.key} className="wpsw-tab" style={{ width: SEG }} onClick={onPress} aria-label={route.name}>
                <span className={`wpsw-ico ${selected ? 'on' : ''}`}>{(ICONS[ORDER[i] ?? 'Profile'] ?? ICONS.Profile!)(color)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ICONS: Record<string, (c: string) => React.ReactNode> = {
  Alarm: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7" stroke={c} strokeWidth="1.7" />
      <path d="M12 9.8v3.4l2.3 1.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4 2.6 6.2M19 4l2.4 2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  Missions: (c) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.2" stroke={c} strokeWidth="1.7" />
      <path d="M8.4 12.2 11 14.8 15.8 9.4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

const SVG_FILTER = `
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="wpsw-liquid" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.011 0.011" numOctaves="2" seed="9" result="n"/>
    <feGaussianBlur in="n" stdDeviation="1.1" result="b"/>
    <feDisplacementMap in="SourceGraphic" in2="b" scale="10" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;

const CSS = `
.wpsw-wrap{
  position:absolute; left:0; right:0; bottom:max(20px, env(safe-area-inset-bottom));
  display:flex; justify-content:center; pointer-events:none; z-index:60;
}
.wpsw{
  position:relative; width:${BAR_W}px; height:${BAR_H}px; border-radius:999px;
  padding:${PAD}px; pointer-events:auto; isolation:isolate;
}
.wpsw.is-light{
  background:rgba(236,240,246,0.55);
  box-shadow: 9px 9px 24px rgba(146,158,178,0.42), -8px -8px 20px rgba(255,255,255,0.85),
    inset 0 1px 0 rgba(255,255,255,0.7);
}
.wpsw.is-dark{
  background:rgba(28,33,44,0.55);
  box-shadow: 9px 9px 26px rgba(0,0,0,0.55), -7px -7px 18px rgba(255,255,255,0.05),
    inset 0 1px 0 rgba(255,255,255,0.10);
}
.wpsw-glass{
  position:absolute; inset:0; border-radius:999px; overflow:hidden; z-index:0;
  backdrop-filter:blur(16px) saturate(180%); -webkit-backdrop-filter:blur(16px) saturate(180%);
  filter:url(#wpsw-liquid);
}
.wpsw-glow{
  position:absolute; top:50%; width:120px; height:120px; margin-left:-60px; margin-top:-60px;
  border-radius:999px; pointer-events:none; z-index:1; opacity:.9;
  transition:left .42s cubic-bezier(.2,.9,.22,1);
  background:radial-gradient(closest-side, rgba(10,132,255,0.18), rgba(10,132,255,0) 70%);
}
.wpsw-pill{
  position:absolute; top:${(BAR_H - PILL) / 2}px; left:0; border-radius:999px; z-index:2;
  transition:transform .44s cubic-bezier(.2,.9,.22,1);
}
.wpsw.is-light .wpsw-pill{
  background:rgba(255,255,255,0.62);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.9), 5px 6px 14px rgba(146,158,178,0.5),
    -4px -4px 10px rgba(255,255,255,0.7);
}
.wpsw.is-dark .wpsw-pill{
  background:rgba(255,255,255,0.13);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.25), 5px 6px 16px rgba(0,0,0,0.5);
}
.wpsw-row{ position:relative; z-index:3; height:100%; display:flex; align-items:center; }
.wpsw-tab{
  height:100%; background:transparent; border:0; outline:none; padding:0; margin:0; cursor:pointer;
  display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent;
}
.wpsw-ico{ display:flex; transition:transform .34s cubic-bezier(.2,.9,.22,1); }
.wpsw-ico.on{ transform:translateY(-1px) scale(1.06); }
.wpsw-tab:active .wpsw-ico{ transform:scale(.88); }
`;
