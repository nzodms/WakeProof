import { isSupabaseConfigured } from './supabase';

/**
 * Mode d'exécution centralisé.
 * - `live` : variables Supabase présentes → vraies données / auth / realtime.
 * - `demo` : variables absentes → données mockées, aucun appel réseau.
 *
 * Toute la logique branchée doit passer par `isLive` / `isDemo` plutôt que de
 * re-tester les variables d'environnement à droite et à gauche.
 */
export type RuntimeMode = 'demo' | 'live';

export const runtimeMode: RuntimeMode = isSupabaseConfigured ? 'live' : 'demo';
export const isLive = runtimeMode === 'live';
export const isDemo = !isLive;

export const RUNTIME_LABEL = isLive ? 'LIVE' : 'DEMO';
