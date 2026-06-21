import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CrewMemberStatus, WakeStatus } from '@/types/domain';

export interface CrewRealtimeHandlers {
  onPresenceSync: (members: CrewMemberStatus[]) => void;
  onWakeEvent: (event: { userId: string; type: string; payload: Record<string, unknown> }) => void;
  onWakeBlast: (blast: { senderId: string; kind: string; tone: string }) => void;
}

export interface CrewPresenceState {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  status: WakeStatus;
  lateMinutes?: number;
  snoozeCount?: number;
}

/**
 * Souscrit au canal Realtime d'un Crew :
 *  - Presence : statut du matin live de chaque membre,
 *  - Broadcast : feed d'événements + Wake Blasts entrants.
 * Renvoie une fonction de désinscription.
 */
export function subscribeToCrew(
  crewId: string,
  me: CrewPresenceState,
  handlers: CrewRealtimeHandlers,
): () => void {
  if (!isSupabaseConfigured) {
    // Mode démo : pas de réseau. On no-op proprement.
    return () => {};
  }

  const channel: RealtimeChannel = supabase.channel(`crew:${crewId}`, {
    config: { presence: { key: me.userId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<CrewPresenceState>();
      const members: CrewMemberStatus[] = Object.values(state)
        .flat()
        .map((m) => ({
          userId: m.userId,
          username: m.username,
          avatarUrl: m.avatarUrl,
          status: m.status,
          lateMinutes: m.lateMinutes,
          snoozeCount: m.snoozeCount,
          updatedAt: new Date().toISOString(),
        }));
      handlers.onPresenceSync(members);
    })
    .on('broadcast', { event: 'wake_event' }, ({ payload }) => handlers.onWakeEvent(payload))
    .on('broadcast', { event: 'wake_blast' }, ({ payload }) => handlers.onWakeBlast(payload))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(me);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Met à jour son propre statut de présence dans le crew. */
export async function broadcastMyStatus(crewId: string, patch: Partial<CrewPresenceState>) {
  if (!isSupabaseConfigured) return;
  const channel = supabase.channel(`crew:${crewId}`);
  await channel.track(patch);
}

/** Émet un événement dans le feed live du crew. */
export async function emitWakeEvent(
  crewId: string,
  event: { userId: string; type: string; payload?: Record<string, unknown> },
) {
  if (!isSupabaseConfigured) return;
  const channel = supabase.channel(`crew:${crewId}`);
  await channel.send({ type: 'broadcast', event: 'wake_event', payload: event });
}
