import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';
import { Alarm } from '@/types/domain';
import { computeWakeScore, WakeScoreBreakdown } from '@/features/wakeScore/wakeScore';

export interface WakeOutcomeInput {
  userId: string;
  alarm: Alarm;
  snoozeCount: number;
  lateMinutes: number;
  wakeCheckPassed?: boolean;
  durationMs?: number;
}

/** Lit régularité (7j) + streak pour nourrir le Wake Score. */
async function readHistory(userId: string): Promise<{ validMorningsLast7: number; streak: number }> {
  if (!isLive) return { validMorningsLast7: 5, streak: 9 };
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from('wake_scores')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', since.toISOString().slice(0, 10)),
    supabase.from('profiles').select('current_streak').eq('id', userId).maybeSingle(),
  ]);
  return {
    validMorningsLast7: Math.min(7, count ?? 0),
    streak: (profile as { current_streak?: number } | null)?.current_streak ?? 0,
  };
}

/**
 * Enregistre un réveil validé : mission_attempt + wake_log + wake_scores.
 * Renvoie le détail du Wake Score (affiché à l'utilisateur).
 */
export async function recordWakeVerified(input: WakeOutcomeInput): Promise<WakeScoreBreakdown> {
  const history = await readHistory(input.userId);
  const breakdown = computeWakeScore({
    woke: true,
    failed: false,
    lateMinutes: input.lateMinutes,
    snoozeCount: input.snoozeCount,
    difficulty: input.alarm.difficulty,
    wakeCheckPassed: input.wakeCheckPassed ?? false,
    validMorningsLast7: history.validMorningsLast7,
    streak: history.streak,
  });

  if (isLive) {
    const now = new Date().toISOString();
    await supabase.from('mission_attempts').insert({
      user_id: input.userId,
      alarm_id: input.alarm.id,
      mission_type: input.alarm.missionType,
      status: 'completed',
      duration_ms: input.durationMs ?? null,
      completed_at: now,
    });
    await supabase.from('wake_logs').insert({
      user_id: input.userId,
      alarm_id: input.alarm.id,
      scheduled_at: now,
      woke_at: now,
      snooze_count: input.snoozeCount,
      late_minutes: input.lateMinutes,
      status: 'wake_verified',
    });
    await supabase
      .from('wake_scores')
      .upsert(
        { user_id: input.userId, date: now.slice(0, 10), score: breakdown.total, breakdown },
        { onConflict: 'user_id,date' },
      );
  }

  return breakdown;
}

/** Log d'un snooze. */
export async function recordSnooze(userId: string, alarm: Alarm, snoozeCount: number): Promise<void> {
  if (!isLive) return;
  await supabase.from('wake_logs').insert({
    user_id: userId,
    alarm_id: alarm.id,
    scheduled_at: new Date().toISOString(),
    snooze_count: snoozeCount,
    status: 'snoozed',
  });
}

/** Résultat d'un Wake Check (réussi / manqué). */
export async function recordWakeCheck(userId: string, alarmId: string, passed: boolean): Promise<void> {
  if (!isLive) return;
  const { data: log } = await supabase
    .from('wake_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('alarm_id', alarmId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const wakeLogId = (log as { id: string } | null)?.id;
  if (!wakeLogId) return;
  await supabase.from('wake_checks').insert({
    wake_log_id: wakeLogId,
    user_id: userId,
    due_at: new Date().toISOString(),
    confirmed_at: passed ? new Date().toISOString() : null,
    passed,
  });
}
