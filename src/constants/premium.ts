export interface PremiumFeature {
  id: string;
  label: string;
  free: string;
  premium: string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  { id: 'alarms', label: 'Alarmes', free: '2 max', premium: 'Illimitées' },
  { id: 'missions', label: 'Missions', free: 'Basiques', premium: 'Avancées (squats, wake check)' },
  { id: 'wake_blast_voice', label: 'Wake Blast vocal', free: '—', premium: 'Inclus' },
  { id: 'leaderboards', label: 'Classements', free: 'Simple', premium: 'Avancés + ligues' },
  { id: 'challenges', label: 'Challenges', free: '—', premium: 'Tous' },
  { id: 'stats', label: 'Statistiques', free: 'Basiques', premium: 'Détaillées' },
  { id: 'sounds', label: 'Sons', free: 'Standards', premium: 'Premium' },
  { id: 'chains', label: 'Routines en chaîne', free: '—', premium: 'Inclus' },
  { id: 'hardcore', label: 'Mode Hardcore', free: '—', premium: 'Inclus' },
];

export const FREE_ALARM_LIMIT = 2;
export const FREE_CREW_LIMIT = 1;
