import { Alarm } from '@/types/domain';
import { getCurrentUser } from '@/store/useSessionStore';
import { alarmScheduler } from '@/features/notifications';
import { setCrewStatus, emitWakeEvent } from '@/features/crew/crewRealtime';
import { WakeScoreBreakdown } from '@/features/wakeScore/wakeScore';
import { recordWakeVerified, recordSnooze } from './wakeService';

export type MissionResult = 'success' | 'failed' | 'cancelled';

export interface WakeFlowParams {
  alarm: Alarm;
  snoozeCount: number;
  lateMinutes: number;
  durationMs?: number;
}

/**
 * Réveil validé : enregistre tout, publie wake_verified dans le Crew, et
 * planifie le Wake Check si la mission le prévoit. Renvoie le Wake Score.
 */
export async function completeWake(params: WakeFlowParams): Promise<WakeScoreBreakdown> {
  const { userId, username, avatarUrl } = getCurrentUser();
  const uid = userId ?? 'demo-user';
  const wakeCheckPlanned = params.alarm.missionType === 'wake_check';

  const breakdown = await recordWakeVerified({
    userId: uid,
    alarm: params.alarm,
    snoozeCount: params.snoozeCount,
    lateMinutes: params.lateMinutes,
    wakeCheckPassed: false,
    durationMs: params.durationMs,
  });

  if (params.alarm.crewId) {
    await setCrewStatus(params.alarm.crewId, {
      userId: uid,
      username,
      avatarUrl,
      status: 'wake_verified',
      lateMinutes: params.lateMinutes,
      snoozeCount: params.snoozeCount,
    });
    await emitWakeEvent(params.alarm.crewId, {
      userId: uid,
      type: 'wake_verified',
      payload: { score: breakdown.total, lateMinutes: params.lateMinutes },
    });
  }

  if (wakeCheckPlanned) {
    const delay = Number((params.alarm.missionConfig as { delayMin?: number }).delayMin ?? 5);
    await alarmScheduler.scheduleWakeCheck(params.alarm.id, delay);
  }

  return breakdown;
}

/** Publie un statut intermédiaire dans le Crew (alarm_ringing, late, etc.). */
export async function publishAlarmStatus(
  alarm: Alarm,
  status: 'alarm_ringing' | 'mission_in_progress' | 'snoozed' | 'late' | 'failed',
  extra?: { lateMinutes?: number; snoozeCount?: number },
): Promise<void> {
  if (!alarm.crewId) return;
  const { userId, username, avatarUrl } = getCurrentUser();
  const uid = userId ?? 'demo-user';
  await setCrewStatus(alarm.crewId, { userId: uid, username, avatarUrl, status, ...extra });
  if (status === 'snoozed' || status === 'late' || status === 'failed') {
    await emitWakeEvent(alarm.crewId, { userId: uid, type: status, payload: extra ?? {} });
  }
}

/** Enregistre un snooze (log + statut Crew). */
export async function logSnooze(alarm: Alarm, snoozeCount: number): Promise<void> {
  const { userId } = getCurrentUser();
  await recordSnooze(userId ?? 'demo-user', alarm, snoozeCount);
  await publishAlarmStatus(alarm, 'snoozed', { snoozeCount });
}
