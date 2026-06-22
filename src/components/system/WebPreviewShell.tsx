import React from 'react';
import { Platform, View } from 'react-native';
import { useTheme } from '@/theme';

/**
 * Sur le web (preview Vercel desktop), encadre l'app dans une largeur iPhone
 * centrée avec un fond extérieur discret — pour qu'elle ressemble à une vraie
 * app mobile et non à une page web étirée. Sur natif, passe-plat plein écran.
 */
export function WebPreviewShell({ children }: { children: React.ReactNode }) {
  const t = useTheme();

  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View
      // @ts-expect-error styles web (vh) acceptées par react-native-web
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: t.colors.webBackdrop,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        // @ts-expect-error styles web (vh) acceptées par react-native-web
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 430,
          height: '100vh',
          maxHeight: 932,
          overflow: 'hidden',
          backgroundColor: t.colors.background,
          borderRadius: 44,
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 60,
          shadowOffset: { width: 0, height: 30 },
        }}
      >
        {children}
      </View>
    </View>
  );
}
