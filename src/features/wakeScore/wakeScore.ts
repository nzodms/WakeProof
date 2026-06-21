import { AlarmDifficulty } from '@/types/domain';

/**
 * Wake Score — ne récompense PAS seulement l'heure la plus tôt.
 * Récompense la fiabilité : à l'heure, mission accomplie, zéro snooze,
 * régularité, streak. Pénalise retard et échec.
 *
 * Implémenté en TypeScript pur pour pouvoir tourner côté app ET côté
 * Edge Function Supabase (validation anti-triche).
 */

export interface WakeScoreInput {
  /** Réveil validé (mission accomplie) ? */
  woke: boolean;
  /** Mission échouée / alarme abandonnée ? */
  failed: boolean;
  /** Minutes de retard vs heure prévue (0 si à l'heure). */
  lateMinutes: number;
  /** Nombre de snoozes. */
  snoozeCount: number;
  /** Difficulté de la mission accomplie. */
  difficulty: AlarmDifficulty;
  /** Wake Check réussi ? */
  wakeCheckPassed: boolean;
  /** Matins validés sur les 7 derniers jours (0..7). */
  validMorningsLast7: number;
  /** Streak courant (jours consécutifs). */
  streak: number;
}

export interface WakeScoreBreakdown {
  base: number;
  punctuality: number;
  mission: number;
  snooze: number;
  wakeCheck: number;
  regularity: number;
  streak: number;
  failurePenalty: number;
  total: number;
}

const MISSION_BONUS: Record<AlarmDifficulty, number> = {
  easy: 10,
  strict: 25,
  hardcore: 50,
};

export function computeWakeScore(input: WakeScoreInput): WakeScoreBreakdown {
  if (input.failed || !input.woke) {
    const failurePenalty = -50;
    return {
      base: 0,
      punctuality: 0,
      mission: 0,
      snooze: 0,
      wakeCheck: 0,
      regularity: 0,
      streak: 0,
      failurePenalty,
      total: clamp(failurePenalty, 0, 999),
    };
  }

  const onTime = input.lateMinutes <= 0;
  const base = onTime ? 100 : 80;
  const punctuality = onTime ? 0 : -Math.min(40, input.lateMinutes * 2);
  const mission = MISSION_BONUS[input.difficulty];
  const snooze = input.snoozeCount === 0 ? 15 : -Math.min(25, input.snoozeCount * 5);
  const wakeCheck = input.wakeCheckPassed ? 15 : 0;
  const regularity = Math.round((input.validMorningsLast7 / 7) * 30);
  const streak = Math.min(40, input.streak * 2);

  const total = base + punctuality + mission + snooze + wakeCheck + regularity + streak;

  return {
    base,
    punctuality,
    mission,
    snooze,
    wakeCheck,
    regularity,
    streak,
    failurePenalty: 0,
    total: clamp(total, 0, 999),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
