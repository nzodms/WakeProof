import { AlarmScheduler } from './AlarmScheduler';
import { expoAlarmScheduler } from './expoAlarmScheduler';

/**
 * Point d'injection unique du planificateur. Remplacer ici par une
 * implémentation native (EAS) le jour venu, sans toucher aux écrans/services.
 */
export const alarmScheduler: AlarmScheduler = expoAlarmScheduler;

export type { AlarmScheduler, AlarmNotificationData } from './AlarmScheduler';
