import { ChallengeType, LeaderboardCategory } from '@/types/domain';

export const LEADERBOARD_CATEGORIES: { id: LeaderboardCategory; label: string; emoji: string }[] = [
  { id: 'students', label: 'Étudiants', emoji: '🎓' },
  { id: 'entrepreneurs', label: 'Entrepreneurs', emoji: '💼' },
  { id: 'athletes', label: 'Sportifs', emoji: '🏋️' },
  { id: 'club_6am', label: '6AM Club', emoji: '🌅' },
  { id: 'no_snooze', label: 'No Snooze', emoji: '⏰' },
  { id: 'hardcore', label: 'Hardcore', emoji: '🔥' },
  { id: 'work_mode', label: 'Work Mode', emoji: '🧠' },
  { id: 'gym_mode', label: 'Gym Mode', emoji: '💪' },
];

export const ONBOARDING_GOALS: { id: string; label: string; emoji: string; sub: string }[] = [
  { id: 'work', label: 'Travail', emoji: '💼', sub: 'Ne plus être en retard au taf' },
  { id: 'gym', label: 'Sport', emoji: '💪', sub: 'Séance matinale garantie' },
  { id: 'study', label: 'Études', emoji: '🎓', sub: 'Commencer la journée tôt' },
  { id: 'discipline', label: 'Discipline', emoji: '🧠', sub: 'Construire une vraie routine' },
  { id: 'no_snooze', label: 'Stop snooze', emoji: '⏰', sub: 'Arrêter de repousser le réveil' },
];

export const CHALLENGE_PRESETS: { type: ChallengeType; title: string; emoji: string; days: number }[] = [
  { type: 'duel_1v1', title: 'Duel 1v1', emoji: '⚔️', days: 7 },
  { type: 'no_snooze_3d', title: '3 jours sans snooze', emoji: '🚫', days: 3 },
  { type: 'wake_7d', title: '7 jours réveil validé', emoji: '✅', days: 7 },
  { type: 'team', title: 'Challenge équipe', emoji: '🤝', days: 7 },
  { type: 'club_6am', title: '6AM Club', emoji: '🌅', days: 7 },
  { type: 'gym_morning', title: 'Gym Morning', emoji: '🏋️', days: 7 },
  { type: 'study_morning', title: 'Study Morning', emoji: '📚', days: 7 },
  { type: 'work_mode', title: 'Work Mode', emoji: '💼', days: 5 },
];
