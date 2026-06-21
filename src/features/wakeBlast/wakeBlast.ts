import { BlastTone, WakeStatus } from '@/types/domain';

/**
 * Règles d'autorisation d'un Wake Blast. Centralisées ici et RE-VÉRIFIÉES
 * côté serveur (Edge Function + RLS). Jamais de harcèlement : limites strictes.
 */

export interface WakeBlastContext {
  // Réglages de confidentialité de la cible
  allowWakeBlasts: boolean;
  allowVoiceBlasts: boolean;
  allowedTone: BlastTone;
  blastWindowStart: string; // "06:00"
  blastWindowEnd: string; // "10:00"
  maxBlastsPerMorning: number;
  blockedUserIds: string[];

  // État courant
  targetStatus: WakeStatus;
  targetLateMinutes: number;
  alarmActive: boolean;
  wakeBlastDelayMin: number; // délai requis après l'heure prévue
  blastsReceivedThisMorning: number;

  // Tentative
  senderId: string;
  requestedTone: BlastTone;
  isVoice: boolean;
  nowMinutesOfDay: number; // minutes depuis minuit, heure locale de la cible
}

export type WakeBlastDenial =
  | 'not_authorized'
  | 'voice_disabled'
  | 'sender_blocked'
  | 'no_active_alarm'
  | 'target_already_up'
  | 'not_late_enough'
  | 'outside_window'
  | 'limit_reached'
  | 'tone_not_allowed';

export interface WakeBlastResult {
  allowed: boolean;
  reason?: WakeBlastDenial;
}

const UP_STATUSES: WakeStatus[] = ['wake_verified'];

export function canSendWakeBlast(ctx: WakeBlastContext): WakeBlastResult {
  if (!ctx.allowWakeBlasts) return deny('not_authorized');
  if (ctx.blockedUserIds.includes(ctx.senderId)) return deny('sender_blocked');
  if (ctx.isVoice && !ctx.allowVoiceBlasts) return deny('voice_disabled');
  if (ctx.requestedTone === 'roast' && ctx.allowedTone === 'motivation')
    return deny('tone_not_allowed');

  if (!ctx.alarmActive) return deny('no_active_alarm');
  if (UP_STATUSES.includes(ctx.targetStatus)) return deny('target_already_up');
  if (ctx.targetLateMinutes < ctx.wakeBlastDelayMin) return deny('not_late_enough');

  const start = toMinutes(ctx.blastWindowStart);
  const end = toMinutes(ctx.blastWindowEnd);
  if (ctx.nowMinutesOfDay < start || ctx.nowMinutesOfDay > end) return deny('outside_window');

  if (ctx.blastsReceivedThisMorning >= ctx.maxBlastsPerMorning) return deny('limit_reached');

  return { allowed: true };
}

function deny(reason: WakeBlastDenial): WakeBlastResult {
  return { allowed: false, reason };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const WAKE_BLAST_DENIAL_COPY: Record<WakeBlastDenial, string> = {
  not_authorized: "Ce membre n'a pas autorisé les Wake Blasts.",
  voice_disabled: 'Les vocaux sont désactivés par ce membre.',
  sender_blocked: 'Tu as été bloqué par ce membre.',
  no_active_alarm: "Aucune alarme active pour ce membre.",
  target_already_up: 'Ce membre est déjà réveillé ✅',
  not_late_enough: "Trop tôt : laisse-lui le délai avant de le blaster.",
  outside_window: 'Hors de la fenêtre horaire autorisée.',
  limit_reached: 'Limite de Wake Blasts atteinte pour ce matin.',
  tone_not_allowed: 'Ce membre accepte seulement le mode Motivation.',
};

/** Quorum pour un Wake Blast par vote du groupe. */
export function isVoteQuorumReached(votes: number, crewSize: number): boolean {
  return votes >= Math.max(2, Math.ceil(crewSize / 3));
}

export const PRESET_BLASTS: { id: string; label: string; tone: BlastTone }[] = [
  { id: 'air_horn', label: 'Corne de brume 📣', tone: 'motivation' },
  { id: 'rooster', label: 'Coq 🐓', tone: 'motivation' },
  { id: 'lets_go', label: '"LET\'S GO !" 🔥', tone: 'motivation' },
  { id: 'roast_1', label: '"Tu branles quoi ?" 💀', tone: 'roast' },
];
