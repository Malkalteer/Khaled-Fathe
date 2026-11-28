import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, User } from '../services/api';
import { AUTH_EXPIRED_EVENT, refreshSession } from '../services/http';

// نسخة مخزنة من المستخدم لعرض الواجهة فوراً فقط — الصلاحيات الحقيقية يتحقق منها الخادم دائماً.
const STORAGE_KEY = 'user';

const readCached = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const writeCached = (user: User | null) => {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  /** true حتى ينتهي التحقق من الجلسة عند فتح الموقع */
  checking: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (data: { username: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(readCached);
  const [checking, setChecking] = useState(true);

  const setUser = useCallback((next: User | null) => {
    writeCached(next);
    setUserState(next);
  }, []);

  // التحقق من الجلسة عند الفتح
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((ok) => {
        if (!ok && !cancelled) setUser(null);
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  useEffect(() => {
    const onRefreshed = (e: Event) => setUser((e as CustomEvent<User>).detail);
    const onExpired = () => setUser(null);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUserState(readCached());
    };
    window.addEventListener('auth:refreshed', onRefreshed);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:refreshed', onRefreshed);
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
      window.removeEventListener('storage', onStorage);
    };
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: Boolean(user?.isAdmin),
      checking,
      login: async (email, password) => {
        const { user: next } = await api.login(email, password);
        setUser(next);
        return next;
      },
      loginWithGoogle: async (credential) => {
        const { user: next } = await api.googleLogin(credential);
        setUser(next);
        return next;
      },
      register: async (data) => {
        await api.register(data);
      },
      logout: async () => {
        await api.logout().catch(() => undefined);
        setUser(null);
      },
    }),
    [user, checking, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
