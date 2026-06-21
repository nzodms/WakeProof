import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Text } from './Text';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Switcher Liquid Glass avec curseur fluide qui glisse sous l'option active. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const count = options.length;
  const segW = width / count;
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  const cursorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(index * segW, { damping: 18, stiffness: 180 }) }],
    width: segW,
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <BlurView
      intensity={24}
      tint={t.isDark ? 'dark' : 'light'}
      style={[styles.track, { borderColor: t.colors.glassBorder, backgroundColor: t.colors.glass }]}
      onLayout={onLayout}
    >
      {width > 0 && (
        <Animated.View
          style={[
            styles.cursor,
            cursorStyle,
            { backgroundColor: t.colors.accentSoft, borderColor: t.colors.glassHighlight },
          ]}
        />
      )}
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={styles.segment}
            onPress={() => {
              if (!active) {
                haptics.selection();
                onChange(opt.value);
              }
            }}
          >
            <Text variant="caption" color={active ? 'accent' : 'secondary'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 4,
  },
  cursor: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
