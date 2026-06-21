import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HaloProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Halo lumineux flou et diffus pour l'ambiance Liquid Glass. */
export function Halo({ color, size = 280, style }: HaloProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: 0.5,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={{ flex: 1, borderRadius: size / 2 }}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}
