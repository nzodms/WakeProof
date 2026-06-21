import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export interface ShareCardRow {
  username: string;
  line: string;
  emoji: string;
}

/**
 * Carte partageable format story 9:16. Premium, drôle, partageable.
 * Capture via react-native-view-shot (à ajouter) → partage natif.
 */
export function ShareCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ShareCardRow[];
}) {
  const t = useTheme();
  return (
    <View style={{ aspectRatio: 9 / 16, borderRadius: t.radius.xl, overflow: 'hidden' }}>
      <LinearGradient colors={['#241640', '#0A0A0F']} style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
        <View>
          <Text variant="micro" style={{ color: t.colors.halo }}>
            WAKEPROOF · {subtitle.toUpperCase()}
          </Text>
          <Text variant="h1" style={{ marginTop: 6 }}>
            {title}
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{r.username}</Text>
                <Text variant="caption" color="secondary">
                  {r.line}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text variant="caption" style={{ color: t.colors.textTertiary }}>
          Rejoins-les sur WakeProof — le réveil qui te force à te lever.
        </Text>
      </LinearGradient>
    </View>
  );
}
