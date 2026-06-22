import { create } from 'zustand';

/**
 * Identité de l'utilisateur courant, exposée hors React pour les services
 * (alarmes, wake flow, crew realtime) qui ne peuvent pas lire le contexte auth.
 * Renseigné par l'AuthProvider.
 */
interface SessionState {
  userId: string | null;
  username: string;
  avatarUrl: string | null;
  setSession: (s: { userId: string; username: string; avatarUrl?: string | null }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  username: 'Moi',
  avatarUrl: null,
  setSession: ({ userId, username, avatarUrl }) =>
    set({ userId, username, avatarUrl: avatarUrl ?? null }),
  clearSession: () => set({ userId: null, username: 'Moi', avatarUrl: null }),
}));

/** Accès synchrone hors composant. */
export function getCurrentUser() {
  const { userId, username, avatarUrl } = useSessionStore.getState();
  return { userId, username, avatarUrl };
}
