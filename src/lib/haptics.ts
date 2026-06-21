import * as Haptics from 'expo-haptics';

/** Petite façade typée autour d'expo-haptics, fail-safe sur web/simulateur. */
export const haptics = {
  impact(strength: 'light' | 'medium' | 'heavy' = 'light') {
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    } as const;
    Haptics.impactAsync(map[strength]).catch(() => {});
  },
  success() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  error() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
  selection() {
    Haptics.selectionAsync().catch(() => {});
  },
};
