import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Halo } from './Halo';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  /** Halos lumineux décoratifs en arrière-plan */
  withHalos?: boolean;
  /** Marge basse pour ne pas masquer la tab bar flottante */
  tabBarSpacing?: boolean;
}

export function Screen({
  children,
  scroll = false,
  contentStyle,
  edges = ['top'],
  withHalos = true,
  tabBarSpacing = false,
}: ScreenProps) {
  const t = useTheme();
  const bottomPad = tabBarSpacing ? 110 : t.spacing.xl;

  const body = (
    <View style={[styles.content, { paddingHorizontal: t.spacing.lg }, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.root, { backgroundColor: t.colors.background }]}>
      <LinearGradient
        colors={[t.colors.gradientStart, t.colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {withHalos && (
        <>
          <Halo color={t.colors.accent} size={320} style={{ top: -80, right: -60 }} />
          <Halo color={t.colors.halo} size={260} style={{ bottom: 40, left: -80 }} />
        </>
      )}
      <SafeAreaView style={styles.root} edges={edges}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottomPad }}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingTop: 8 },
});
