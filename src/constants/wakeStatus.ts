import { WakeStatus } from '@/types/domain';

export const WAKE_STATUS_META: Record<
  WakeStatus,
  { label: string; emoji: string; tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }
> = {
  sleeping: { label: 'Dort', emoji: '😴', tone: 'neutral' },
  alarm_ringing: { label: 'Ça sonne', emoji: '🔔', tone: 'warning' },
  mission_in_progress: { label: 'En mission', emoji: '⚡', tone: 'accent' },
  wake_verified: { label: 'Réveillé', emoji: '✅', tone: 'success' },
  snoozed: { label: 'A snoozé', emoji: '😮‍💨', tone: 'warning' },
  late: { label: 'En retard', emoji: '⏰', tone: 'danger' },
  failed: { label: 'Échec', emoji: '💀', tone: 'danger' },
  wake_blast_received: { label: 'Blasté', emoji: '📣', tone: 'danger' },
};
