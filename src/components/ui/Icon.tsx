import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'alarm'
  | 'mission'
  | 'crew'
  | 'leaderboard'
  | 'profile'
  | 'bolt'
  | 'flame'
  | 'check'
  | 'close'
  | 'camera'
  | 'qr'
  | 'chevron'
  | 'lock'
  | 'plus';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

/** Set d'icônes minimalistes (stroke, arrondi) cohérent Apple-like. */
export function Icon({ name, size = 24, color, strokeWidth = 1.8 }: IconProps) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'alarm' && (
        <>
          <Circle cx={12} cy={13} r={7} {...p} />
          <Path d="M12 10v3l2 2" {...p} />
          <Path d="M5 3 2 6M19 3l3 3" {...p} />
        </>
      )}
      {name === 'mission' && (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Circle cx={12} cy={12} r={3.5} {...p} />
          <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...p} />
        </>
      )}
      {name === 'crew' && (
        <>
          <Circle cx={9} cy={9} r={3} {...p} />
          <Path d="M3.5 19a5.5 5.5 0 0 1 11 0" {...p} />
          <Path d="M16 6.5a3 3 0 0 1 0 5.8M16.5 19a5.5 5.5 0 0 0-3-4.9" {...p} />
        </>
      )}
      {name === 'leaderboard' && (
        <>
          <Path d="M7 21V11M12 21V5M17 21v-7" {...p} />
          <Path d="M4 21h16" {...p} />
          <Path d="M9.5 4 12 2l2.5 2" {...p} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} />
        </>
      )}
      {name === 'bolt' && <Path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" {...p} />}
      {name === 'flame' && (
        <Path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c2 2 3 3 3 6a5 5 0 0 1-10 0c0-4 3-6 5-13Z" {...p} />
      )}
      {name === 'check' && <Path d="M4 12.5 9 17.5 20 6.5" {...p} strokeWidth={2.2} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6 6 18" {...p} strokeWidth={2.2} />}
      {name === 'camera' && (
        <>
          <Rect x={3} y={7} width={18} height={13} rx={3} {...p} />
          <Circle cx={12} cy={13.5} r={3.5} {...p} />
          <Path d="M8 7l1.5-2.5h5L16 7" {...p} />
        </>
      )}
      {name === 'qr' && (
        <>
          <Rect x={3} y={3} width={7} height={7} rx={1.5} {...p} />
          <Rect x={14} y={3} width={7} height={7} rx={1.5} {...p} />
          <Rect x={3} y={14} width={7} height={7} rx={1.5} {...p} />
          <Path d="M14 14h3v3M21 14v7M17 21h4M17 17.5h.01" {...p} />
        </>
      )}
      {name === 'chevron' && <Path d="M9 6l6 6-6 6" {...p} />}
      {name === 'lock' && (
        <>
          <Rect x={5} y={11} width={14} height={9} rx={2.5} {...p} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...p} strokeWidth={2.2} />}
    </Svg>
  );
}
