import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';
import { CrewMemberStatus, WakeStatus } from '@/types/domain';

export interface CrewPresenceState {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  status: WakeStatus;
  lateMinutes?: number;
  snoozeCount?: number;
}

export interface CrewRealtimeHandlers {
  onPresenceSync: (members: CrewMemberStatus[]) => void;
  onWakeEvent?: (event: { userId: string; type: string; payload: Record<string, unknown> }) => void;
}

// Un seul canal par crew, partagé entre la souscription (page Crew) et la
// publication de statut (flow d'alarme), pour que la présence reste cohérente.
const channels = new Map<string, RealtimeChannel>();
const lastPresence = new Map<string, CrewPresenceState>();

function getChannel(crewId: string): RealtimeChannel {
  let channel = channels.get(crewId);
  if (!channel) {
    channel = supabase.channel(`crew:${crewId}`, { config: { presence: { key: crewId } } });
    channels.set(crewId, channel);
  }
  return channel;
}

/** Souscrit au canal Realtime d'un Crew. Renvoie une fonction de désinscription. */
export function subscribeToCrew(
  crewId: string,
  me: CrewPresenceState,
  handlers: CrewRealtimeHandlers,
): () => void {
  if (!isLive) return () => {};

  const channel = getChannel(crewId);
  lastPresence.set(crewId, me);

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
    .on('broadcast', { event: 'wake_event' }, ({ payload }) => handlers.onWakeEvent?.(payload))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track(me);
    });

  return () => {
    supabase.removeChannel(channel);
    channels.delete(crewId);
  };
}

/** Met à jour son statut de présence dans le crew (depuis le flow d'alarme). */
export async function setCrewStatus(crewId: string, patch: Partial<CrewPresenceState>): Promise<void> {
  if (!isLive) return;
  const channel = getChannel(crewId);
  const merged = { ...(lastPresence.get(crewId) ?? {}), ...patch } as CrewPresenceState;
  lastPresence.set(crewId, merged);
  try {
    await channel.track(merged);
  } catch {
    /* canal pas encore prêt — ignoré */
  }
}

/** Émet un événement dans le feed live + persiste dans wake_events. */
export async function emitWakeEvent(
  crewId: string,
  event: { userId: string; type: string; payload?: Record<string, unknown> },
): Promise<void> {
  if (!isLive) return;
  const channel = getChannel(crewId);
  await channel.send({ type: 'broadcast', event: 'wake_event', payload: event });
  await supabase
    .from('wake_events')
    .insert({ crew_id: crewId, user_id: event.userId, type: event.type, payload: event.payload ?? {} })
    .then(undefined, () => {});
}
