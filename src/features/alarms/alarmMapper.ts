import { Alarm, AlarmDifficulty, MissionType } from '@/types/domain';

export interface AlarmRow {
  id: string;
  user_id: string;
  label: string | null;
  time_local: string;
  difficulty: AlarmDifficulty;
  sound_id: string;
  snooze_allowed: boolean;
  max_snoozes: number;
  mission_id: string | null;
  crew_id: string | null;
  wake_blast_enabled: boolean;
  wake_blast_delay_min: number;
  grace_period_min: number;
  is_active: boolean;
  notification_ids: string[] | null;
}

export interface MissionRow {
  id: string;
  type: MissionType;
  config: Record<string, unknown>;
}

export interface ScheduleRow {
  weekday: number;
  enabled: boolean;
}

/** Reconstruit un Alarm domaine depuis ses lignes DB jointes. */
export function rowToAlarm(
  alarm: AlarmRow,
  mission: MissionRow | null,
  schedules: ScheduleRow[],
): Alarm {
  return {
    id: alarm.id,
    label: alarm.label ?? 'Réveil',
    timeLocal: alarm.time_local,
    weekdays: schedules.filter((s) => s.enabled).map((s) => s.weekday).sort(),
    difficulty: alarm.difficulty,
    soundId: alarm.sound_id,
    snoozeAllowed: alarm.snooze_allowed,
    maxSnoozes: alarm.max_snoozes,
    missionType: mission?.type ?? 'calc',
    missionConfig: mission?.config ?? {},
    crewId: alarm.crew_id,
    wakeBlastEnabled: alarm.wake_blast_enabled,
    wakeBlastDelayMin: alarm.wake_blast_delay_min,
    gracePeriodMin: alarm.grace_period_min,
    isActive: alarm.is_active,
  };
}

/** Colonnes de la table alarms (hors mission_id / notification_ids gérés à part). */
export function alarmToRow(alarm: Alarm, userId: string) {
  return {
    user_id: userId,
    label: alarm.label,
    time_local: alarm.timeLocal,
    difficulty: alarm.difficulty,
    sound_id: alarm.soundId,
    snooze_allowed: alarm.snoozeAllowed,
    max_snoozes: alarm.maxSnoozes,
    crew_id: alarm.crewId,
    wake_blast_enabled: alarm.wakeBlastEnabled,
    wake_blast_delay_min: alarm.wakeBlastDelayMin,
    grace_period_min: alarm.gracePeriodMin,
    is_active: alarm.isActive,
  };
}
