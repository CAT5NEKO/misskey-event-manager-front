export interface User {
  id: string;
  misskey_username: string;
  misskey_host: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  notes: string | null;
  event_date: string | null;
  deadline: string | null;
  notification_timing: number[];
  status: string;
  created_at: string;
  updated_at: string;
  creator?: User;
  participants?: Participant[];
  current_user_status?: string | null;
}

export interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'declined' | 'pending';
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface InstanceAllow {
  id: string;
  host: string;
  description: string | null;
  enabled: boolean;
  protected: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor?: User;
}

export interface LoginResponse {
  miauth_url: string;
  session_id: string;
  csrf_token: string;
}

export interface CallbackResponse {
  jwt: string;
  refresh_token: string;
  user: User;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  notes?: string;
  event_date?: string;
  deadline?: string;
  notification_timing?: number[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  notes?: string;
  event_date?: string;
  deadline?: string;
  notification_timing?: number[];
  status?: string;
}

export interface JoinEventInput {
  status: string;
  comment?: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  actor_id?: string;
  action?: string;
  target_type?: string;
  from?: string;
  to?: string;
}
