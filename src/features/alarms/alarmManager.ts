import { Alarm } from '@/types/domain';
import { isLive } from '@/lib/runtimeMode';
import { useAlarmStore } from '@/store/useAlarmStore';
import { getCurrentUser } from '@/store/useSessionStore';
import { alarmScheduler } from '@/features/notifications';
import * as alarmService from './alarmService';

/**
 * Orchestrateur unique du cycle de vie d'une alarme : persistance Supabase
 * (en live), planification des notifications, et synchro du store local.
 * Les écrans n'appellent QUE ce manager — aucune logique réseau dans l'UI.
 */

export async function requestAlarmPermissions(): Promise<boolean> {
  return alarmScheduler.requestPermissions();
}

/** Charge les alarmes de l'utilisateur (live). En démo, le store fait foi. */
export async function loadAlarms(): Promise<void> {
  const { userId } = getCurrentUser();
  if (!isLive || !userId) return;
  const alarms = await alarmService.listAlarms(userId);
  useAlarmStore.getState().setAlarms(alarms);
}

/** Crée ou met à jour une alarme + (re)planifie ses notifications. */
export async function saveAlarm(alarm: Alarm): Promise<Alarm> {
  const store = useAlarmStore.getState();
  const { userId } = getCurrentUser();
  const isNew = !store.getAlarm(alarm.id);

  let finalAlarm = alarm;
  if (isLive && userId) {
    if (isNew) {
      const newId = await alarmService.createAlarm(userId, alarm);
      if (newId) finalAlarm = { ...alarm, id: newId };
    } else {
      await alarmService.updateAlarm(userId, alarm);
    }
  }

  // (Re)planifie les notifications locales.
  await alarmScheduler.requestPermissions();
  const previousIds = store.notificationIds[finalAlarm.id] ?? [];
  const ids = finalAlarm.isActive
    ? await alarmScheduler.rescheduleAlarm(finalAlarm, previousIds)
    : (await alarmScheduler.cancelAlarm(previousIds), []);

  store.upsertAlarm(finalAlarm);
  store.setNotificationIds(finalAlarm.id, ids);
  if (isLive && userId) await alarmService.saveNotificationIds(finalAlarm.id, ids);

  return finalAlarm;
}

/** Active / désactive une alarme et synchronise ses notifications. */
export async function toggleAlarm(alarm: Alarm): Promise<void> {
  const store = useAlarmStore.getState();
  const nextActive = !alarm.isActive;
  const updated = { ...alarm, isActive: nextActive };

  const previousIds = store.notificationIds[alarm.id] ?? [];
  const ids = nextActive
    ? await alarmScheduler.rescheduleAlarm(updated, previousIds)
    : (await alarmScheduler.cancelAlarm(previousIds), []);

  store.toggleAlarm(alarm.id);
  store.setNotificationIds(alarm.id, ids);
  if (isLive) {
    await alarmService.setActive(alarm.id, nextActive);
    await alarmService.saveNotificationIds(alarm.id, ids);
  }
}

/** Supprime une alarme et annule ses notifications. */
export async function removeAlarm(alarm: Alarm): Promise<void> {
  const store = useAlarmStore.getState();
  const ids = store.notificationIds[alarm.id] ?? [];
  await alarmScheduler.cancelAlarm(ids);
  store.removeAlarm(alarm.id);
  if (isLive) await alarmService.deleteAlarm(alarm.id);
}
