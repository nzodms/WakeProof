import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarmes',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        bypassDnd: true,
      });
    }
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Programme une notification d'alarme. NOTE : ce n'est PAS une alarme bloquante
 * (cf. docs/TECH_LIMITS.md). C'est la couche 1. Les couches 3/4 (push backend,
 * module natif) renforcent la fiabilité.
 */
export async function scheduleAlarmNotification(params: {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  weekday?: number; // 1=dimanche (expo) ; omis = quotidien
}): Promise<string | null> {
  try {
    // SDK 51 : trigger calendaire { hour, minute, weekday?, repeats }.
    const trigger =
      params.weekday != null
        ? { weekday: params.weekday, hour: params.hour, minute: params.minute, repeats: true }
        : { hour: params.hour, minute: params.minute, repeats: true };
    return await Notifications.scheduleNotificationAsync({
      identifier: params.id,
      content: { title: params.title, body: params.body, sound: 'default' },
      trigger,
    });
  } catch {
    return null;
  }
}

export async function cancelAlarmNotification(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* no-op */
  }
}
