import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Alarm: 'alarm-outline',
  Missions: 'checkmark-circle-outline',
  Crew: 'people-outline',
  Leaderboard: 'trophy-outline',
  Profile: 'person-outline',
};

const BAR_W = 272;
const BAR_H = 56;
const PAD = 6;
const COUNT = 5;
const SEG = (BAR_W - PAD * 2) / COUNT;
const PILL = 46;

/**
 * Switcher Apple Liquid Glass — version NATIVE.
 * Capsule blur translucide, pastille douce qui glisse (spring), icônes fines.
 * Pas de labels, pas de trait bleu, pas de contour agressif.
 */
export function AppleGlassSwitcher({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const dark = t.isDark;
  const x = useSharedValue(state.index);

  useEffect(() => {
    x.value = withSpring(state.index, { damping: 18, stiffness: 200, mass: 0.7 });
  }, [state.index, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: PAD + x.value * SEG + (SEG - PILL) / 2 }],
  }));

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) + 8 }]} pointerEvents="box-none">
      <BlurView
        intensity={dark ? 30 : 60}
        tint={dark ? 'dark' : 'light'}
        style={[
          styles.bar,
          {
            backgroundColor: dark ? 'rgba(40,40,44,0.45)' : 'rgba(255,255,255,0.55)',
            borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)',
          },
        ]}
      >
        {/* Reflet supérieur doux */}
        <View pointerEvents="none" style={[styles.sheen, { opacity: dark ? 0.5 : 0.8 }]} />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            pillStyle,
            {
              backgroundColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.85)',
              borderColor: dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.95)',
            },
          ]}
        />

        {state.routes.map((route, i) => {
          const selected = state.index === i;
          const color = selected ? t.colors.text : t.colors.textTertiary;
          const onPress = () => {
            if (selected) return;
            haptics.selection();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={6}>
              <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={23} color={color} />
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    width: BAR_W,
    height: BAR_H,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_H * 0.5,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pill: {
    position: 'absolute',
    top: (BAR_H - PILL) / 2,
    left: 0,
    width: PILL,
    height: PILL,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tab: { width: SEG, height: BAR_H, alignItems: 'center', justifyContent: 'center' },
});
