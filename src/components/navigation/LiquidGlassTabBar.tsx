import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Icon, IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';

const TAB_ICONS: Record<string, IconName> = {
  Alarm: 'alarm',
  Missions: 'mission',
  Crew: 'crew',
  Leaderboard: 'leaderboard',
  Profile: 'profile',
};

const TAB_LABELS: Record<string, string> = {
  Alarm: 'Réveil',
  Missions: 'Missions',
  Crew: 'Crew',
  Leaderboard: 'Rang',
  Profile: 'Profil',
};

const H_PADDING = 20;
const BAR_PADDING = 6;

/**
 * Bottom navigation "Liquid Glass" : pill flottante translucide, blur, ombre
 * douce, et un curseur fluide (liquid glass) qui glisse sous l'onglet actif.
 */
export function LiquidGlassTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = React.useState(0);

  const count = state.routes.length;
  const innerWidth = barWidth - BAR_PADDING * 2;
  const segW = innerWidth / count;

  const cursorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(state.index * segW, { damping: 16, stiffness: 160 }) }],
    width: segW,
  }));

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 10, paddingHorizontal: H_PADDING }]} pointerEvents="box-none">
      <BlurView
        intensity={40}
        tint={t.isDark ? 'dark' : 'light'}
        style={[styles.bar, t.shadows.floating, { borderColor: t.colors.glassBorder }]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={[t.colors.glassHighlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.glass }]} pointerEvents="none" />

        {barWidth > 0 && (
          <Animated.View style={[styles.cursorContainer, cursorStyle]} pointerEvents="none">
            <LinearGradient
              colors={[t.colors.accent, t.isDark ? '#5648D9' : '#9A8BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cursor, { shadowColor: t.colors.accent }]}
            />
          </Animated.View>
        )}

        <View style={styles.row}>
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            const onPress = () => {
              haptics.selection();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <Pressable key={route.key} style={styles.tab} onPress={onPress} hitSlop={8}>
                <TabItem name={route.name} focused={focused} />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function TabItem({ name, focused }: { name: string; focused: boolean }) {
  const t = useTheme();
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 1, { damping: 14 }) }],
  }));
  const color = focused ? '#FFFFFF' : t.colors.textTertiary;

  return (
    <Animated.View style={[styles.item, animStyle]}>
      <Icon name={TAB_ICONS[name] ?? 'profile'} size={22} color={color} strokeWidth={focused ? 2 : 1.7} />
      {focused && (
        <Text variant="micro" style={{ color, marginTop: 2, fontSize: 9 }}>
          {TAB_LABELS[name]?.toUpperCase()}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    width: '100%',
    height: 66,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: BAR_PADDING,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', flex: 1 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { alignItems: 'center', justifyContent: 'center', height: '100%' },
  cursorContainer: { position: 'absolute', top: BAR_PADDING, bottom: BAR_PADDING, left: BAR_PADDING },
  cursor: {
    flex: 1,
    borderRadius: 999,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
