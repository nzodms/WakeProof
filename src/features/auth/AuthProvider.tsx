import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isLive } from '@/lib/runtimeMode';
import { useSessionStore } from '@/store/useSessionStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Profile } from '@/types/domain';
import * as authService from './authService';
import { fetchProfile, completeOnboarding as persistOnboarding } from '@/features/profile/profileService';

type AuthStatus = 'loading' | 'signedOut' | 'onboarding' | 'ready';

interface AuthContextValue {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  profile: (Profile & { onboardingCompleted: boolean }) | null;
  signUp: (email: string, password: string) => Promise<authService.AuthResult>;
  signIn: (email: string, password: string) => Promise<authService.AuthResult>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: { goal: string; username?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER = { id: 'demo-user', username: 'Toi', avatarUrl: null };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const onboardingDoneDemo = useOnboardingStore((s) => s.completed);
  const completeDemoOnboarding = useOnboardingStore((s) => s.complete);

  const [status, setStatus] = useState<AuthStatus>(isLive ? 'loading' : 'onboarding');
  const [session, setSessionState] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthContextValue['profile']>(null);

  // -- Mode démo : pas de réseau, on s'appuie sur l'onboarding store. --------
  useEffect(() => {
    if (isLive) return;
    setSession({ userId: DEMO_USER.id, username: DEMO_USER.username });
    setStatus(onboardingDoneDemo ? 'ready' : 'onboarding');
  }, [onboardingDoneDemo, setSession]);

  // -- Mode live : session Supabase persistante + profil. --------------------
  const loadForSession = useCallback(
    async (s: Session | null) => {
      if (!s) {
        clearSession();
        setProfile(null);
        setStatus('signedOut');
        return;
      }
      const p = await fetchProfile(s.user.id);
      setProfile(p);
      setSession({
        userId: s.user.id,
        username: p?.username ?? s.user.email?.split('@')[0] ?? 'Moi',
        avatarUrl: p?.avatarUrl,
      });
      setStatus(p?.onboardingCompleted ? 'ready' : 'onboarding');
    },
    [clearSession, setSession],
  );

  useEffect(() => {
    if (!isLive) return;
    supabase.auth.getSession().then(({ data }) => {
      setSessionState(data.session);
      void loadForSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSessionState(s);
      void loadForSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadForSession]);

  const completeOnboarding = useCallback(
    async (data: { goal: string; username?: string }) => {
      if (!isLive) {
        completeDemoOnboarding();
        return;
      }
      if (!session) return;
      await persistOnboarding(session.user.id, data);
      await loadForSession(session);
    },
    [session, loadForSession, completeDemoOnboarding],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      userId: session?.user.id ?? (isLive ? null : DEMO_USER.id),
      email: session?.user.email ?? null,
      profile,
      signUp: authService.signUp,
      signIn: authService.signIn,
      signOut: authService.signOut,
      completeOnboarding,
    }),
    [status, session, profile, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
