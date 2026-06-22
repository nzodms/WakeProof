import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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

const BAR_WIDTH = 270;
const BAR_HEIGHT = 54;
const PADDING = 5;
const TAB_COUNT = 5;
const TAB_WIDTH = (BAR_WIDTH - PADDING * 2) / TAB_COUNT;
const PILL_SIZE = 44;

/**
 * Switcher Apple Liquid Glass : petite capsule flottante, blur, pastille active
 * qui glisse (spring), pas de labels. Compatible clair/sombre.
 */
export function AppleGlassSwitcher({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const isDark = t.isDark;
  const x = useSharedValue(state.index);

  useEffect(() => {
    x.value = withSpring(state.index, { damping: 22, stiffness: 260 });
  }, [state.index, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: PADDING + x.value * TAB_WIDTH + (TAB_WIDTH - PILL_SIZE) / 2 }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView
        intensity={isDark ? 40 : 55}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.bar,
          {
            backgroundColor: isDark ? 'rgba(22,22,28,0.55)' : 'rgba(255,255,255,0.52)',
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.activePill,
            pillStyle,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.72)',
              borderColor: isDark ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.9)',
            },
          ]}
        />
        {state.routes.map((route, index) => {
          const selected = state.index === index;
          const color = selected ? t.colors.accent : t.colors.textTertiary;
          const onPress = () => {
            if (selected) return;
            haptics.selection();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={8}>
              <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={23} color={color} />
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 28, alignItems: 'center' },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  activePill: {
    position: 'absolute',
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: 999,
    borderWidth: 1,
  },
  tab: { width: TAB_WIDTH, height: BAR_HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
