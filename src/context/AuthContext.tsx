import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';

interface AuthCtx {
  /** False until the initial session check (and any redirect-based auth) has resolved. */
  authLoading: boolean;
  session: Session | null;
  user: User | null;
  /** Whether real Supabase credentials are configured at all — when false, sign-in is
   * unavailable and the app runs in guest/demo mode only. */
  configured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      authLoading,
      session,
      user: session?.user ?? null,
      configured: supabaseConfigured,
      signUp: async (email, password) => {
        if (!supabaseConfigured) return { error: 'Sign-up is not available yet.', needsEmailConfirmation: false };
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message, needsEmailConfirmation: false };
        // If email confirmation is required, Supabase returns a user with no session yet.
        const needsEmailConfirmation = !data.session;
        return { error: null, needsEmailConfirmation };
      },
      signIn: async (email, password) => {
        if (!supabaseConfigured) return { error: 'Sign-in is not available yet.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? error.message : null };
      },
      signOut: async () => {
        if (!supabaseConfigured) return;
        await supabase.auth.signOut();
      },
    }),
    [authLoading, session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
