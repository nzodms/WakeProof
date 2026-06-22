import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { navigate } from '@/lib/navigationRef';
import { useAlarmStore } from '@/store/useAlarmStore';
import { AlarmNotificationData } from './AlarmScheduler';

function handle(data: AlarmNotificationData | undefined) {
  if (!data) return;
  if (data.type === 'alarm') {
    useAlarmStore.getState().triggerAlarm(data.alarmId);
    navigate('ActiveAlarm', { alarmId: data.alarmId });
  } else if (data.type === 'wake_check') {
    navigate('WakeCheck', { alarmId: data.alarmId });
  }
}

/**
 * Branche les listeners de notifications :
 *  - tap (réception en background/quit) → ouvre l'écran adéquat,
 *  - réception au premier plan → ouvre directement l'alarme active.
 */
export function useNotificationRouter() {
  useEffect(() => {
    // Cas : l'app était fermée et a été ouverte via la notification.
    Notifications.getLastNotificationResponseAsync().then((res) => {
      const data = res?.notification.request.content.data as AlarmNotificationData | undefined;
      handle(data);
    });

    const tapSub = Notifications.addNotificationResponseReceivedListener((res) => {
      handle(res.notification.request.content.data as AlarmNotificationData | undefined);
    });

    const fgSub = Notifications.addNotificationReceivedListener((notif) => {
      const data = notif.request.content.data as AlarmNotificationData | undefined;
      if (data?.type === 'alarm') handle(data);
    });

    return () => {
      tapSub.remove();
      fgSub.remove();
    };
  }, []);
}
