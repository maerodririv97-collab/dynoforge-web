import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** true mientras se resuelve la sesión inicial o se carga el perfil. */
  loading: boolean;
  /** Usuario con sesión pero sin perfil, inactivo o de un taller inactivo. */
  blockedReason: string | null;
  /** true cuando el usuario llegó por un enlace de recuperación de contraseña. */
  recovering: boolean;
  clearRecovering: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setBlockedReason(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, workshops(is_active)')
      .eq('id', s.user.id)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      setBlockedReason('Tu usuario no tiene perfil asignado. Contacta al administrador.');
    } else {
      const { workshops, ...p } = data as Profile & { workshops: { is_active: boolean } | null };
      setProfile(p);
      if (!p.is_active) setBlockedReason('Tu usuario está desactivado.');
      else if (!p.is_superadmin && workshops && !workshops.is_active)
        setBlockedReason('Tu taller está desactivado.');
      else setBlockedReason(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadProfile(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'TOKEN_REFRESHED') {
        setSession(s);
        return;
      }
      setSession(s);
      // Fuera del callback: supabase-js no permite await de otras llamadas aquí.
      setTimeout(() => void loadProfile(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        blockedReason,
        recovering,
        clearRecovering: () => setRecovering(false),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}
