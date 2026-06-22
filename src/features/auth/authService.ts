import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

/** Inscription email + mot de passe. Le trigger SQL crée profile/privacy/sub. */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!isLive) return { ok: true };
  const { error } = await supabase.auth.signUp({ email: email.trim(), password });
  return error ? { ok: false, error: humanizeAuthError(error.message) } : { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isLive) return { ok: true };
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { ok: false, error: humanizeAuthError(error.message) } : { ok: true };
}

export async function signOut(): Promise<void> {
  if (!isLive) return;
  await supabase.auth.signOut();
}

function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.';
  if (m.includes('already registered')) return 'Cet email a déjà un compte.';
  if (m.includes('password')) return 'Mot de passe trop court (6 caractères min).';
  if (m.includes('email')) return 'Email invalide.';
  return 'Une erreur est survenue. Réessaie.';
}
