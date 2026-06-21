// Types de domaine partagés (UI + logique). Miroir des enums Postgres.

export type AlarmDifficulty = 'easy' | 'strict' | 'hardcore';

export type MissionType =
  | 'calc'
  | 'qr_code'
  | 'photo_proof'
  | 'shake'
  | 'steps'
  | 'squats'
  | 'wake_check';

export type WakeStatus =
  | 'sleeping'
  | 'alarm_ringing'
  | 'mission_in_progress'
  | 'wake_verified'
  | 'snoozed'
  | 'late'
  | 'failed'
  | 'wake_blast_received';

export type ProofShareMode = 'validated_only' | 'blurred' | 'visible_24h' | 'private';

export type WakeEventType =
  | 'wake_verified'
  | 'mission_completed'
  | 'photo_proof'
  | 'snoozed'
  | 'failed'
  | 'wake_blast_sent'
  | 'wake_blast_received'
  | 'streak_lost'
  | 'badge_earned'
  | 'league_up'
  | 'league_down';

export type BlastKind = 'voice' | 'tts_text' | 'preset_sound' | 'collective' | 'vote';
export type BlastTone = 'motivation' | 'roast';

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite';

export type ChallengeType =
  | 'duel_1v1'
  | 'no_snooze_3d'
  | 'wake_7d'
  | 'team'
  | 'club_6am'
  | 'gym_morning'
  | 'study_morning'
  | 'work_mode';

export type LeaderboardCategory =
  | 'students'
  | 'entrepreneurs'
  | 'athletes'
  | 'club_6am'
  | 'no_snooze'
  | 'hardcore'
  | 'work_mode'
  | 'gym_mode';

export interface Profile {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  goal?: string | null;
  currentStreak: number;
  bestStreak: number;
  leagueTier: LeagueTier;
}

export interface Alarm {
  id: string;
  label?: string;
  timeLocal: string; // "07:00"
  weekdays: number[]; // 0=dimanche
  difficulty: AlarmDifficulty;
  soundId: string;
  snoozeAllowed: boolean;
  maxSnoozes: number;
  missionType: MissionType;
  missionConfig: Record<string, unknown>;
  crewId?: string | null;
  wakeBlastEnabled: boolean;
  wakeBlastDelayMin: number;
  gracePeriodMin: number;
  isActive: boolean;
}

export interface CrewMemberStatus {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  status: WakeStatus;
  lateMinutes?: number;
  snoozeCount?: number;
  updatedAt: string;
}
