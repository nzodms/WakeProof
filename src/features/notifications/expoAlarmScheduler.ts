import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '@/types/domain';
import { AlarmScheduler, AlarmNotificationData } from './AlarmScheduler';

const HYPE_BODIES = [
  'Ça sonne. Une mission te sépare de ta journée. 🔥',
  'Debout — pas de bouton magique, juste ta mission.',
  'Ton Crew te regarde. On se lève.',
];

class ExpoAlarmScheduler implements AlarmScheduler {
  async requestPermissions(): Promise<boolean> {
    try {
      const current = await Notifications.getPermissionsAsync();
      let granted = current.granted;
      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted = req.granted;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarms', {
          name: 'Alarmes',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          bypassDnd: true,
        });
      }
      return granted;
    } catch {
      return false;
    }
  }

  async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    if (!alarm.isActive) return [];
    const [hour, minute] = parseTime(alarm.timeLocal);
    const data: AlarmNotificationData = { type: 'alarm', alarmId: alarm.id };
    const content: Notifications.NotificationContentInput = {
      title: alarm.label ? `⏰ ${alarm.label}` : '⏰ WakeProof',
      body: HYPE_BODIES[Math.floor(Math.random() * HYPE_BODIES.length)]!,
      sound: 'default',
      data,
    };
    const channel = Platform.OS === 'android' ? { channelId: 'alarms' } : {};

    // Tous les jours (ou aucun jour précisé) → un seul trigger quotidien.
    const daily = alarm.weekdays.length === 0 || alarm.weekdays.length === 7;
    const ids: string[] = [];

    try {
      if (daily) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { hour, minute, repeats: true, ...channel },
        });
        ids.push(id);
      } else {
        for (const weekday of alarm.weekdays) {
          const id = await Notifications.scheduleNotificationAsync({
            content,
            // expo : weekday 1=dimanche .. 7=samedi ; domaine : 0=dimanche.
            trigger: { weekday: weekday + 1, hour, minute, repeats: true, ...channel },
          });
          ids.push(id);
        }
      }
    } catch {
      // En dev/simulateur sans permission, on n'empêche pas la création.
    }
    return ids;
  }

  async cancelAlarm(notificationIds: string[]): Promise<void> {
    await Promise.all(
      notificationIds.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
    );
  }

  async rescheduleAlarm(alarm: Alarm, previousIds: string[]): Promise<string[]> {
    await this.cancelAlarm(previousIds);
    return this.scheduleAlarm(alarm);
  }

  async scheduleWakeCheck(alarmId: string, delayMin: number): Promise<string | null> {
    const data: AlarmNotificationData = { type: 'wake_check', alarmId };
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: '👀 Wake Check',
          body: 'Toujours debout ? Confirme avant de te rendormir.',
          sound: 'default',
          data,
        },
        trigger: {
          seconds: Math.max(1, delayMin * 60),
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: 'alarms' } : {}),
        },
      });
    } catch {
      return null;
    }
  }
}

function parseTime(timeLocal: string): [number, number] {
  const [h, m] = timeLocal.split(':').map(Number);
  return [h ?? 7, m ?? 0];
}

export const expoAlarmScheduler = new ExpoAlarmScheduler();
