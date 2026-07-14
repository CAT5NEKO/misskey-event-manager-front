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

function saveSessions(sessions: Session[]) {
  localStorage.setItem('miSchedule_sessions', JSON.stringify(sessions));
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

let refreshPromise: Promise<boolean> | null = null;

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
  if (activeIndex >= sessions.length) {
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

export function updateActiveTokens(jwt: string, refreshToken: string) {
  const s = getActiveSession();
  if (s) {
    s.jwt = jwt;
    s.refreshToken = refreshToken;
    saveSessions(sessions);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  sessions = loadSessions();
  activeIndex = loadActiveIndex();
  const refresh = getCurrentRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (res.status === 403) {
      sessions = loadSessions();
      activeIndex = loadActiveIndex();
      return getCurrentAccessToken() != null;
    }
    if (!res.ok) return false;
    const data = await res.json();
    updateActiveTokens(data.jwt, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function ensureValidToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken();
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getCurrentAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (res.status === 401 && getCurrentRefreshToken()) {
    const refreshed = await ensureValidToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getCurrentAccessToken()}`;
      res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
    }
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }

  const data = await res.json();

  if (!res.ok) {
    const message = data.error || `API error: ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
