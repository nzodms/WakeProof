import { Alarm } from '@/types/domain';

/** Données embarquées dans chaque notification, lues au tap. */
export type AlarmNotificationData =
  | { type: 'alarm'; alarmId: string }
  | { type: 'wake_check'; alarmId: string };

/**
 * Abstraction du planificateur d'alarme. L'implémentation MVP utilise
 * expo-notifications (couche 1). Une implémentation native EAS (AlarmManager /
 * critical alerts) pourra la remplacer sans toucher au reste de l'app.
 */
export interface AlarmScheduler {
  requestPermissions(): Promise<boolean>;
  /** Programme l'alarme (une notif par jour répété). Renvoie les identifiants. */
  scheduleAlarm(alarm: Alarm): Promise<string[]>;
  /** Annule les notifications correspondant aux identifiants donnés. */
  cancelAlarm(notificationIds: string[]): Promise<void>;
  /** Reprogramme : annule les anciennes puis replanifie. */
  rescheduleAlarm(alarm: Alarm, previousIds: string[]): Promise<string[]>;
  /** Programme un Wake Check à +delayMin minutes. */
  scheduleWakeCheck(alarmId: string, delayMin: number): Promise<string | null>;
}
