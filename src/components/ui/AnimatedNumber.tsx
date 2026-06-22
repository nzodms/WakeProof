import React, { useEffect, useRef, useState } from 'react';
import { TextStyle } from 'react-native';
import { Text } from './Text';
import { TypographyVariant } from '@/theme/tokens';

interface AnimatedNumberProps {
  value: number;
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  style?: TextStyle;
  duration?: number;
  prefix?: string;
}

/** Compteur qui s'anime de 0 jusqu'à la valeur (ease-out), web + natif. */
export function AnimatedNumber({
  value,
  variant = 'display',
  color = 'primary',
  style,
  duration = 900,
  prefix = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <Text variant={variant} color={color} style={style}>
      {prefix}
      {display}
    </Text>
  );
}
