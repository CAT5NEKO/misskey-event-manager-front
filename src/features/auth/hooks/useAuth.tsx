import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  api,
  getSessions,
  getActiveSession,
  addSession,
  removeSession,
  switchSession,
  clearAllSessions,
  getCurrentAccessToken,
  updateActiveTokens,
} from '@shared/api/client';
import type { User, LoginResponse, CallbackResponse } from '@shared/types';

interface SessionInfo {
  userId: string;
  name: string;
  username: string;
  host: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

interface AuthContextType {
  sessions: SessionInfo[];
  activeIndex: number;
  user: User | null;
  loading: boolean;
  login: (host: string) => Promise<LoginResponse>;
  handleCallback: (session: string, csrfToken: string) => Promise<User>;
  handleAddAccountCallback: (session: string, csrfToken: string) => Promise<User>;
  switchAccount: (index: number) => Promise<void>;
  removeAccount: (index: number) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = localStorage.getItem('miSchedule_active');
    return idx ? parseInt(idx, 10) : 0;
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const sessions = getSessions().map((s) => ({
    userId: s.userId,
    name: s.name,
    username: s.username,
    host: s.host,
    isAdmin: s.isAdmin,
    avatarUrl: s.avatarUrl,
  }));

  const fetchUser = useCallback(async () => {
    const token = getCurrentAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await api<User>('/auth/me');
      setUser(u);
    } catch {
      const s = getActiveSession();
      if (s) removeSession(activeIndex);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [activeIndex]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (host: string): Promise<LoginResponse> => {
    const res = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ host }),
    });
    return res;
  };

  const handleCallback = useCallback(async (session: string, csrfToken: string) => {
    clearAllSessions();
    const res = await api<CallbackResponse>('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ session, csrf_token: csrfToken }),
    });
    addSession({
      userId: res.user.id,
      jwt: res.jwt,
      refreshToken: res.refresh_token,
      name: res.user.name,
      username: res.user.misskey_username,
      host: res.user.misskey_host,
      isAdmin: res.user.is_admin,
      avatarUrl: res.user.avatar_url,
    });
    setActiveIndex(0);
    setUser(res.user);
    return res.user;
  }, []);

  const handleAddAccountCallback = useCallback(async (session: string, csrfToken: string) => {
    const res = await api<CallbackResponse>('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ session, csrf_token: csrfToken }),
    });
    addSession({
      userId: res.user.id,
      jwt: res.jwt,
      refreshToken: res.refresh_token,
      name: res.user.name,
      username: res.user.misskey_username,
      host: res.user.misskey_host,
      isAdmin: res.user.is_admin,
      avatarUrl: res.user.avatar_url,
    });
    const newIndex = getSessions().length - 1;
    setActiveIndex(newIndex);
    setUser(res.user);
    return res.user;
  }, []);

  const switchAccount = async (index: number) => {
    switchSession(index);
    setActiveIndex(index);
    try {
      const u = await api<User>('/auth/me');
      setUser(u);
    } catch {
      removeSession(index);
      setUser(null);
      setActiveIndex(0);
    }
  };

  const removeAccountHandler = (index: number) => {
    removeSession(index);
    const newIdx = Math.max(0, index - 1);
    switchSession(newIdx);
    setActiveIndex(newIdx);
    fetchUser();
  };

  const logout = async () => {
    try {
      await api('/auth/revoke', { method: 'POST' });
    } catch {}
    removeSession(activeIndex);
    if (getSessions().length > 0) {
      const newIdx = Math.max(0, activeIndex - 1);
      switchSession(newIdx);
      setActiveIndex(newIdx);
      fetchUser();
    } else {
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    await api('/auth/account', { method: 'DELETE' });
    removeSession(activeIndex);
    if (getSessions().length > 0) {
      const newIdx = Math.max(0, activeIndex - 1);
      switchSession(newIdx);
      setActiveIndex(newIdx);
      fetchUser();
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        sessions,
        activeIndex,
        user,
        loading,
        login,
        handleCallback,
        handleAddAccountCallback,
        switchAccount,
        removeAccount: removeAccountHandler,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
