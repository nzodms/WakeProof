import React from 'react';
import { Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  /** Halo d'accent très subtil en haut (off par défaut, DA iOS épurée). */
  withHalos?: boolean;
  /** Marge basse pour ne pas masquer le switcher flottant. */
  tabBarSpacing?: boolean;
  /** Élément fixe (ex : bouton +) au-dessus du contenu scrollable. */
  floating?: React.ReactNode;
}

export function Screen({
  children,
  scroll = false,
  contentStyle,
  edges = ['top'],
  withHalos = false,
  tabBarSpacing = false,
  floating,
}: ScreenProps) {
  const t = useTheme();
  const bottomPad = tabBarSpacing ? 116 : t.spacing.xl;
  // Sur web (cadre fixe), pas d'inset système : on rajoute un padding haut propre.
  const topEdges: Edge[] = Platform.OS === 'web' ? [] : edges;

  const body = (
    <View
      style={[
        styles.content,
        { paddingHorizontal: t.spacing.lg, paddingTop: Platform.OS === 'web' ? 20 : 8 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: t.colors.background }]}>
      <LinearGradient
        colors={[t.colors.gradientStart, t.colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {withHalos && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -120,
            alignSelf: 'center',
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: t.colors.halo,
          }}
        />
      )}
      <SafeAreaView style={styles.root} edges={topEdges}>
        {scroll ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
      {floating && (
        <View style={styles.floating} pointerEvents="box-none">
          {floating}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  floating: { position: 'absolute', right: 18, bottom: 96 },
});
