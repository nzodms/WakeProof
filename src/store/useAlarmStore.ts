import { create } from 'zustand';
import { Alarm } from '@/types/domain';
import { DEMO_ALARMS } from '@/constants/demoData';
import { isDemo } from '@/lib/runtimeMode';

interface AlarmState {
  alarms: Alarm[];
  loaded: boolean;
  /** Alarme en cours de sonnerie (écran Active Alarm), sinon null. */
  ringingAlarmId: string | null;
  /** Timestamp (ms) du déclenchement, pour calculer le temps écoulé. */
  ringingStartedAt: number | null;
  /** Identifiants de notifications planifiées, par alarme. */
  notificationIds: Record<string, string[]>;

  setAlarms: (alarms: Alarm[]) => void;
  upsertAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  setNotificationIds: (id: string, ids: string[]) => void;
  triggerAlarm: (id: string) => void;
  dismissAlarm: () => void;
  getAlarm: (id: string) => Alarm | undefined;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  // En démo on pré-remplit ; en live le store part vide et est hydraté au login.
  alarms: isDemo ? DEMO_ALARMS : [],
  loaded: isDemo,
  ringingAlarmId: null,
  ringingStartedAt: null,
  notificationIds: {},

  setAlarms: (alarms) => set({ alarms, loaded: true }),
  upsertAlarm: (alarm) =>
    set((s) => {
      const exists = s.alarms.some((a) => a.id === alarm.id);
      return {
        alarms: exists ? s.alarms.map((a) => (a.id === alarm.id ? alarm : a)) : [alarm, ...s.alarms],
      };
    }),
  removeAlarm: (id) => set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) })),
  toggleAlarm: (id) =>
    set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)) })),
  setNotificationIds: (id, ids) =>
    set((s) => ({ notificationIds: { ...s.notificationIds, [id]: ids } })),
  triggerAlarm: (id) => set({ ringingAlarmId: id, ringingStartedAt: Date.now() }),
  dismissAlarm: () => set({ ringingAlarmId: null, ringingStartedAt: null }),
  getAlarm: (id) => get().alarms.find((a) => a.id === id),
}));
