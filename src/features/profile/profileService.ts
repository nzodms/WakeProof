import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';
import { Profile } from '@/types/domain';

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  goal: string | null;
  current_streak: number;
  best_streak: number;
  league_tier: Profile['leagueTier'];
  onboarding_completed: boolean;
}

function mapProfile(row: ProfileRow): Profile & { onboardingCompleted: boolean } {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    goal: row.goal,
    currentStreak: row.current_streak ?? 0,
    bestStreak: row.best_streak ?? 0,
    leagueTier: row.league_tier ?? 'bronze',
    onboardingCompleted: row.onboarding_completed ?? false,
  };
}

export async function fetchProfile(userId: string) {
  if (!isLive) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, goal, current_streak, best_streak, league_tier, onboarding_completed')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

/** Finalise l'onboarding : enregistre objectif + username + ouvre la confidentialité. */
export async function completeOnboarding(
  userId: string,
  data: { goal: string; username?: string },
): Promise<void> {
  if (!isLive) return;
  const patch: Record<string, unknown> = { goal: data.goal, onboarding_completed: true };
  if (data.username) patch.username = data.username;
  await supabase.from('profiles').update(patch).eq('id', userId);
  // S'assure que la ligne de confidentialité existe (le trigger la crée déjà).
  await supabase.from('social_privacy_settings').upsert({ user_id: userId }, { onConflict: 'user_id' });
}

export async function updateProfile(userId: string, patch: Partial<Pick<Profile, 'displayName' | 'avatarUrl'>>) {
  if (!isLive) return;
  await supabase
    .from('profiles')
    .update({ display_name: patch.displayName, avatar_url: patch.avatarUrl })
    .eq('id', userId);
}
