import { create } from 'zustand';
import { Alarm } from '@/types/domain';
import { DEMO_ALARMS } from '@/constants/demoData';

interface AlarmState {
  alarms: Alarm[];
  /** Alarme en cours de sonnerie (écran Active Alarm), sinon null. */
  ringingAlarmId: string | null;
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (id: string, patch: Partial<Alarm>) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  triggerAlarm: (id: string) => void;
  dismissAlarm: () => void;
  getAlarm: (id: string) => Alarm | undefined;
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: DEMO_ALARMS,
  ringingAlarmId: null,
  addAlarm: (alarm) => set((s) => ({ alarms: [alarm, ...s.alarms] })),
  updateAlarm: (id, patch) =>
    set((s) => ({ alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  removeAlarm: (id) => set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) })),
  toggleAlarm: (id) =>
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
    })),
  triggerAlarm: (id) => set({ ringingAlarmId: id }),
  dismissAlarm: () => set({ ringingAlarmId: null }),
  getAlarm: (id) => get().alarms.find((a) => a.id === id),
}));
