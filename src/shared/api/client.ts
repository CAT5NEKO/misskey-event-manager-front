const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface Session {
  userId: string;
  jwt: string;
  refreshToken: string;
  name: string;
  username: string;
  host: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem('miSchedule_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(newSessions: Session[]) {
  localStorage.setItem('miSchedule_sessions', JSON.stringify(newSessions));
}

let sessions: Session[] = loadSessions();
let activeIndex: number = (() => {
  const idx = localStorage.getItem('miSchedule_active');
  return idx ? parseInt(idx, 10) : 0;
})();

function loadActiveIndex(): number {
  const idx = localStorage.getItem('miSchedule_active');
  return idx ? parseInt(idx, 10) : 0;
}

window.addEventListener('storage', (e) => {
  if (e.key === 'miSchedule_sessions') {
    sessions = loadSessions();
  }
  if (e.key === 'miSchedule_active') {
    activeIndex = loadActiveIndex();
  }
});

const refreshPromises = new Map<string, Promise<boolean>>();

interface RefreshLockManager {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

async function withRefreshLock<T>(callback: () => Promise<T>): Promise<T> {
  if (typeof navigator === 'undefined') return callback();
  const locks = (navigator as unknown as { locks?: RefreshLockManager }).locks;
  if (!locks) return callback();
  return locks.request('miSchedule-token-refresh', callback);
}

export function getSessions(): Session[] {
  return sessions;
}

export function getActiveSession(): Session | null {
  if (sessions.length === 0 || activeIndex >= sessions.length) return null;
  return sessions[activeIndex];
}

export function addSession(session: Session) {
  const existing = sessions.findIndex((s) => s.userId === session.userId);
  if (existing >= 0) {
    sessions[existing] = session;
  } else {
    sessions.push(session);
  }
  activeIndex = sessions.length - 1;
  saveSessions(sessions);
  localStorage.setItem('miSchedule_active', String(activeIndex));
}

export function removeSession(index: number) {
  sessions.splice(index, 1);
  if (index < activeIndex) {
    activeIndex--;
  } else if (activeIndex >= sessions.length) {
    activeIndex = Math.max(0, sessions.length - 1);
  }
  saveSessions(sessions);
  localStorage.setItem('miSchedule_active', String(activeIndex));
}

export function switchSession(index: number) {
  if (index >= 0 && index < sessions.length) {
    activeIndex = index;
    localStorage.setItem('miSchedule_active', String(activeIndex));
  }
}

export function clearAllSessions() {
  sessions = [];
  activeIndex = 0;
  localStorage.removeItem('miSchedule_sessions');
  localStorage.removeItem('miSchedule_active');
}

export function getCurrentAccessToken(): string | null {
  const s = getActiveSession();
  return s?.jwt ?? null;
}

export function getCurrentRefreshToken(): string | null {
  const s = getActiveSession();
  return s?.refreshToken ?? null;
}

export function updateSessionTokens(userId: string, jwt: string, refreshToken: string) {
  sessions = loadSessions();
  const index = sessions.findIndex((s) => s.userId === userId);
  if (index < 0) return;
  sessions[index] = { ...sessions[index], jwt, refreshToken };
  saveSessions(sessions);
}

export function updateActiveTokens(jwt: string, refreshToken: string) {
  const s = getActiveSession();
  if (s) updateSessionTokens(s.userId, jwt, refreshToken);
}

function removeSessionByUserId(userId: string) {
  sessions = loadSessions();
  const index = sessions.findIndex((s) => s.userId === userId);
  if (index < 0) return;

  sessions.splice(index, 1);
  activeIndex = loadActiveIndex();
  if (index < activeIndex) {
    activeIndex--;
  } else if (activeIndex >= sessions.length) {
    activeIndex = Math.max(0, sessions.length - 1);
  }
  saveSessions(sessions);
  localStorage.setItem('miSchedule_active', String(activeIndex));
}

export function isTokenExpiringSoon(token: string | null, skewSeconds = 60): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const rawPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(rawPayload);
    if (!payload.exp) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - nowInSeconds <= skewSeconds;
  } catch {
    return false;
  }
}

async function refreshAccessToken(userId: string, expectedRefreshToken: string): Promise<boolean> {
  return withRefreshLock(async () => {
    sessions = loadSessions();
    activeIndex = loadActiveIndex();
    const session = sessions.find((s) => s.userId === userId);
    if (!session?.refreshToken) return false;
    if (session.refreshToken !== expectedRefreshToken) {
      return true;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: expectedRefreshToken }),
      });

      if (res.status === 401) {
        await new Promise((r) => setTimeout(r, 200));
        sessions = loadSessions();
        const latest = sessions.find((s) => s.userId === userId);
        if (latest && latest.refreshToken !== expectedRefreshToken && latest.jwt) {
          return true;
        }
        removeSessionByUserId(userId);
        return false;
      }

      if (res.status === 403) {
        removeSessionByUserId(userId);
        return false;
      }

      if (!res.ok) return false;

      const data = await res.json();
      updateSessionTokens(userId, data.jwt, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  });
}

export async function ensureValidToken(): Promise<boolean> {
  sessions = loadSessions();
  activeIndex = loadActiveIndex();
  const session = getActiveSession();
  if (!session?.refreshToken) return false;

  const pending = refreshPromises.get(session.userId);
  if (pending) return pending;

  const promise = refreshAccessToken(session.userId, session.refreshToken).finally(() => {
    refreshPromises.delete(session.userId);
  });
  refreshPromises.set(session.userId, promise);
  return promise;
}

const checkAndRefreshToken = async () => {
  const token = getCurrentAccessToken();
  const refresh = getCurrentRefreshToken();
  if (!token || !refresh) return;
  if (isTokenExpiringSoon(token, 120)) {
    await ensureValidToken();
  }
};

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkAndRefreshToken();
  }
});

window.addEventListener('focus', () => {
  checkAndRefreshToken();
});

setInterval(() => {
  checkAndRefreshToken();
}, 60000);

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getCurrentAccessToken();
  const refreshToken = getCurrentRefreshToken();

  if (token && refreshToken && isTokenExpiringSoon(token, 60)) {
    await ensureValidToken();
    token = getCurrentAccessToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (res.status === 401 && getCurrentRefreshToken()) {
    const refreshed = await ensureValidToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getCurrentAccessToken()}`;
      res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
    } else if (!getCurrentAccessToken()) {
      window.location.assign('/login?reason=session_expired');
      return {} as T;
    }
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as { error?: string })?.error || `API error: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
