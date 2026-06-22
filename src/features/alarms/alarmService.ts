import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';
import { Alarm } from '@/types/domain';
import { AlarmRow, MissionRow, ScheduleRow, alarmToRow, rowToAlarm } from './alarmMapper';

/**
 * Accès Supabase pur pour les alarmes (alarms + missions + alarm_schedules).
 * En mode démo, toutes les fonctions sont des no-op : le store local fait foi.
 */

export async function listAlarms(userId: string): Promise<Alarm[]> {
  if (!isLive) return [];
  const { data: alarms } = await supabase
    .from('alarms')
    .select('*')
    .eq('user_id', userId)
    .order('time_local');
  if (!alarms) return [];

  const missionIds = alarms.map((a) => (a as AlarmRow).mission_id).filter(Boolean) as string[];
  const alarmIds = alarms.map((a) => (a as AlarmRow).id);

  const [{ data: missions }, { data: schedules }] = await Promise.all([
    missionIds.length
      ? supabase.from('missions').select('id, type, config').in('id', missionIds)
      : Promise.resolve({ data: [] as MissionRow[] }),
    supabase.from('alarm_schedules').select('alarm_id, weekday, enabled').in('alarm_id', alarmIds),
  ]);

  const missionById = new Map((missions ?? []).map((m) => [(m as MissionRow).id, m as MissionRow]));
  const schedulesByAlarm = new Map<string, ScheduleRow[]>();
  for (const s of (schedules ?? []) as (ScheduleRow & { alarm_id: string })[]) {
    const arr = schedulesByAlarm.get(s.alarm_id) ?? [];
    arr.push({ weekday: s.weekday, enabled: s.enabled });
    schedulesByAlarm.set(s.alarm_id, arr);
  }

  return (alarms as AlarmRow[]).map((row) =>
    rowToAlarm(row, row.mission_id ? missionById.get(row.mission_id) ?? null : null, schedulesByAlarm.get(row.id) ?? []),
  );
}

/** Crée mission + alarme + plannings. Renvoie l'id d'alarme persisté. */
export async function createAlarm(userId: string, alarm: Alarm): Promise<string | null> {
  if (!isLive) return alarm.id;

  const { data: mission, error: mErr } = await supabase
    .from('missions')
    .insert({ user_id: userId, type: alarm.missionType, config: alarm.missionConfig })
    .select('id')
    .single();
  if (mErr || !mission) return null;

  const { data: created, error: aErr } = await supabase
    .from('alarms')
    .insert({ ...alarmToRow(alarm, userId), mission_id: mission.id })
    .select('id')
    .single();
  if (aErr || !created) return null;

  await replaceSchedules(created.id, alarm.weekdays);
  return created.id;
}

export async function updateAlarm(userId: string, alarm: Alarm): Promise<void> {
  if (!isLive) return;
  // Upsert mission liée puis l'alarme.
  const { data: existing } = await supabase.from('alarms').select('mission_id').eq('id', alarm.id).single();
  let missionId = (existing as { mission_id: string | null } | null)?.mission_id ?? null;
  if (missionId) {
    await supabase.from('missions').update({ type: alarm.missionType, config: alarm.missionConfig }).eq('id', missionId);
  } else {
    const { data: m } = await supabase
      .from('missions')
      .insert({ user_id: userId, type: alarm.missionType, config: alarm.missionConfig })
      .select('id')
      .single();
    missionId = m?.id ?? null;
  }
  await supabase.from('alarms').update({ ...alarmToRow(alarm, userId), mission_id: missionId }).eq('id', alarm.id);
  await replaceSchedules(alarm.id, alarm.weekdays);
}

export async function deleteAlarm(alarmId: string): Promise<void> {
  if (!isLive) return;
  await supabase.from('alarms').delete().eq('id', alarmId);
}

export async function setActive(alarmId: string, active: boolean): Promise<void> {
  if (!isLive) return;
  await supabase.from('alarms').update({ is_active: active }).eq('id', alarmId);
}

export async function saveNotificationIds(alarmId: string, ids: string[]): Promise<void> {
  if (!isLive) return;
  await supabase.from('alarms').update({ notification_ids: ids }).eq('id', alarmId);
}

export async function getNotificationIds(alarmId: string): Promise<string[]> {
  if (!isLive) return [];
  const { data } = await supabase.from('alarms').select('notification_ids').eq('id', alarmId).single();
  return ((data as { notification_ids: string[] | null } | null)?.notification_ids) ?? [];
}

async function replaceSchedules(alarmId: string, weekdays: number[]): Promise<void> {
  await supabase.from('alarm_schedules').delete().eq('alarm_id', alarmId);
  if (weekdays.length === 0) return;
  await supabase
    .from('alarm_schedules')
    .insert(weekdays.map((weekday) => ({ alarm_id: alarmId, weekday, enabled: true })));
}
