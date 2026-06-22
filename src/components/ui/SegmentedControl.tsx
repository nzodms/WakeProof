import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { neo } from '@/lib/webNeo';
import { Text } from './Text';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Segmented control Apple : piste creusée (inset) + thumb relevé qui glisse. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const count = options.length;
  const inner = width - 8;
  const segW = inner / count;
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(index * segW, { damping: 20, stiffness: 220 }) }],
    width: segW,
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      {...neo('inset')}
      onLayout={onLayout}
      style={[styles.track, { backgroundColor: t.colors.surfaceSoft, borderColor: t.colors.glassBorder }]}
    >
      {width > 0 && (
        <Animated.View
          {...neo('raised-sm')}
          style={[styles.thumb, thumbStyle, { backgroundColor: t.colors.surface }]}
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
            <Text variant="caption" color={active ? 'primary' : 'secondary'} style={{ fontWeight: active ? '700' : '500' }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 42,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 4,
  },
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 999 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
