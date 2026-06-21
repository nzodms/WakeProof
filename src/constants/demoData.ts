import { Alarm, CrewMemberStatus, WakeEventType } from '@/types/domain';

/** Données de démonstration pour faire vivre l'UI sans backend configuré. */

export const DEMO_ALARMS: Alarm[] = [
  {
    id: 'a1',
    label: 'Salle de sport',
    timeLocal: '06:30',
    weekdays: [1, 2, 3, 4, 5],
    difficulty: 'hardcore',
    soundId: 'rise',
    snoozeAllowed: false,
    maxSnoozes: 0,
    missionType: 'squats',
    missionConfig: { target: 10 },
    crewId: 'crew1',
    wakeBlastEnabled: true,
    wakeBlastDelayMin: 5,
    gracePeriodMin: 2,
    isActive: true,
  },
  {
    id: 'a2',
    label: 'Travail',
    timeLocal: '07:15',
    weekdays: [1, 2, 3, 4, 5],
    difficulty: 'strict',
    soundId: 'default',
    snoozeAllowed: true,
    maxSnoozes: 1,
    missionType: 'calc',
    missionConfig: { count: 3, digits: 2 },
    crewId: null,
    wakeBlastEnabled: false,
    wakeBlastDelayMin: 10,
    gracePeriodMin: 5,
    isActive: false,
  },
];

export const DEMO_CREW = {
  id: 'crew1',
  name: 'Team Muscu',
  memberCount: 4,
  inviteCode: 'a1b2c3',
  category: 'gym_mode',
};

export const DEMO_CREW_MEMBERS: CrewMemberStatus[] = [
  { userId: 'u1', username: 'Enzo', status: 'wake_verified', updatedAt: '', lateMinutes: 0 },
  { userId: 'u2', username: 'Lucas', status: 'mission_in_progress', updatedAt: '', snoozeCount: 0 },
  { userId: 'u3', username: 'Max', status: 'snoozed', updatedAt: '', snoozeCount: 4, lateMinutes: 8 },
  { userId: 'u4', username: 'Hugo', status: 'late', updatedAt: '', lateMinutes: 12 },
];

export interface DemoFeedItem {
  id: string;
  type: WakeEventType;
  username: string;
  text: string;
  emoji: string;
  time: string;
}

export const DEMO_FEED: DemoFeedItem[] = [
  { id: 'f1', type: 'wake_verified', username: 'Enzo', text: 'réveillé à 6h33', emoji: '✅', time: 'à l’instant' },
  { id: 'f2', type: 'wake_blast_received', username: 'Max', text: '4 snoozes + Wake Blast reçu', emoji: '💀', time: '2 min' },
  { id: 'f3', type: 'mission_completed', username: 'Lucas', text: '0 snooze, mission squats', emoji: '🔥', time: '5 min' },
  { id: 'f4', type: 'badge_earned', username: 'Hugo', text: 'badge "Comeback" gagné', emoji: '🏅', time: '1 j' },
];

export const DEMO_LEADERBOARD = [
  { rank: 1, username: 'Hugo', score: 312, streak: 14 },
  { rank: 2, username: 'Enzo', score: 298, streak: 9 },
  { rank: 3, username: 'Lucas', score: 271, streak: 6 },
  { rank: 4, username: 'Max', score: 184, streak: 0 },
];
