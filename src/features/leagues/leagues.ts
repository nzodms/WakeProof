import { LeagueTier } from '@/types/domain';

export const LEAGUE_ORDER: LeagueTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'elite',
];

export const LEAGUE_META: Record<LeagueTier, { label: string; color: string; emoji: string }> = {
  bronze: { label: 'Bronze', color: '#CD7F32', emoji: '🥉' },
  silver: { label: 'Silver', color: '#C0C0C0', emoji: '🥈' },
  gold: { label: 'Gold', color: '#FFD700', emoji: '🥇' },
  platinum: { label: 'Platinum', color: '#7FD8E0', emoji: '💠' },
  diamond: { label: 'Diamond', color: '#8AB6FF', emoji: '💎' },
  elite: { label: 'Elite', color: '#B98BFF', emoji: '👑' },
};

/**
 * Promotion / relégation hebdomadaire. Top `promoteCount` montent,
 * bottom `relegateCount` descendent.
 */
export function resolveLeagueMovement(
  tier: LeagueTier,
  rank: number,
  totalPlayers: number,
  promoteCount = 5,
  relegateCount = 5,
): { newTier: LeagueTier; movement: 'up' | 'down' | 'stay' } {
  const idx = LEAGUE_ORDER.indexOf(tier);

  if (rank <= promoteCount && idx < LEAGUE_ORDER.length - 1) {
    return { newTier: LEAGUE_ORDER[idx + 1]!, movement: 'up' };
  }
  if (rank > totalPlayers - relegateCount && idx > 0) {
    return { newTier: LEAGUE_ORDER[idx - 1]!, movement: 'down' };
  }
  return { newTier: tier, movement: 'stay' };
}
