import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';

/**
 * Référence de navigation globale, utilisable hors composants React
 * (ex : ouvrir l'écran Active Alarm quand l'utilisateur tape une notification).
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
) {
  if (navigationRef.isReady()) {
    // @ts-expect-error variadic forwarding
    navigationRef.navigate(...args);
  }
}
