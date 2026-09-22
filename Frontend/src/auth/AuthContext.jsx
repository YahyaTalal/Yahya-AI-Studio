import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { setTokenGetter, onUnauthorized } from '../api';

const AuthContext = createContext(null);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

/**
 * Decides how the app authenticates:
 *  1. VITE_DEV_BYPASS=1  → instant bypass, no login UI (dev override).
 *  2. GET /api/auth/status → { mode: "bypass" } → bypass user (Windows
 *     localhost flow behaves exactly like today: straight into the editor).
 *  3. Otherwise → Supabase Auth (email/password), session restored on mount.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBypass, setIsBypass] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [configError, setConfigError] = useState('');
  const tokenRef = useRef(null);
  const supabaseRef = useRef(null);

  const applySession = (session) => {
    tokenRef.current = session?.access_token || null;
    setUser(session?.user ? { ...session.user, bypass: false } : null);
  };

  useEffect(() => {
    let cancelled = false;
    let authSub = null;

    // api.js needs a live token getter — a ref so it never goes stale.
    setTokenGetter(() => tokenRef.current);
    // A 401 from the backend means the session is dead → back to login.
    onUnauthorized(() => {
      tokenRef.current = null;
      setUser(null);
    });

    const init = async () => {
      // 1. Dev override: force bypass without calling the backend.
      if (import.meta.env.VITE_DEV_BYPASS === '1') {
        if (!cancelled) {
          setIsBypass(true);
          tokenRef.current = null;
          setUser({ id: 'local-user', email: 'local@studio.local', bypass: true });
          setLoading(false);
        }
        return;
      }

      // 2. Ask the backend which auth mode it's in (no auth required).
      try {
        const r = await fetch(API_BASE + '/api/auth/status');
        if (r.ok) {
          const d = await r.json();
          if (d.mode === 'bypass') {
            if (!cancelled) {
              setIsBypass(true);
              tokenRef.current = null;
              setUser({ id: 'local-user', email: 'local@studio.local', bypass: true });
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Backend unreachable — fall through to Supabase mode so a useful
        // login screen (or config error) is shown instead of a dead page.
      }

      // 3. Supabase mode.
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        if (!cancelled) {
          setConfigError('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing).');
          setLoading(false);
        }
        return;
      }
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseRef.current = client;
      setSupabase(client);
      try {
        const { data } = await client.auth.getSession();
        if (!cancelled) applySession(data.session);
      } catch {
        // ignore — user will just see the login screen
      }
      const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
        if (!cancelled) applySession(session);
      });
      authSub = sub.subscription;
      if (!cancelled) setLoading(false);
    };

    init();
    return () => {
      cancelled = true;
      authSub?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email, password) => {
    if (!supabaseRef.current) throw new Error('Auth is not configured.');
    const { data, error } = await supabaseRef.current.auth.signInWithPassword({ email, password });
    if (error) throw error;
    applySession(data.session);
    return data.user;
  };

  const signUp = async (email, password) => {
    if (!supabaseRef.current) throw new Error('Auth is not configured.');
    const { data, error } = await supabaseRef.current.auth.signUp({ email, password });
    if (error) throw error;
    applySession(data.session);
    return data.user;
  };

  const signOut = async () => {
    try { await supabaseRef.current?.auth.signOut(); } catch { /* noop */ }
    tokenRef.current = null;
    // In bypass mode the "user" is local; keep them signed in to the editor.
    if (!isBypass) setUser(null);
  };

  const updatePassword = async (newPassword) => {
    if (!supabaseRef.current) throw new Error('Auth is not configured.');
    const { error } = await supabaseRef.current.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    isBypass,
    configError,
    supabase,
    signIn,
    signUp,
    signOut,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
