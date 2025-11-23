import type { User, UserRole } from '@/types';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  const user = userJson ? JSON.parse(userJson) : null;

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  };
}

export function setAuthState(token: string, user: User): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function isExecutive(user: User | null): boolean {
  return hasRole(user, ['administrator', 'executive']);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['administrator']);
}

export const PERMISSIONS = {
  // Policy permissions
  POLICY_VIEW: 'policy:view',
  POLICY_CREATE: 'policy:create',
  POLICY_EDIT: 'policy:edit',
  POLICY_DELETE: 'policy:delete',
  POLICY_APPROVE: 'policy:approve',

  // Resource permissions
  RESOURCE_VIEW: 'resource:view',
  RESOURCE_ALLOCATE: 'resource:allocate',
  RESOURCE_APPROVE: 'resource:approve',

  // Metrics permissions
  METRICS_VIEW: 'metrics:view',
  METRICS_EDIT: 'metrics:edit',
  REPORTS_GENERATE: 'reports:generate',

  // Emergency permissions
  EMERGENCY_VIEW: 'emergency:view',
  EMERGENCY_RESPOND: 'emergency:respond',
  EMERGENCY_DECLARE: 'emergency:declare',

  // Admin permissions
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export async function login(email: string, password: string): Promise<AuthState> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message);
  }

  const data = await response.json();
  const { token, user } = data.data;

  // Verify user has appropriate role
  if (!isExecutive(user)) {
    throw new Error('Access denied. Executive or Administrator role required.');
  }

  setAuthState(token, user);
  return { user, token, isAuthenticated: true };
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).catch(() => {
      // Ignore logout API errors
    });
  }
  clearAuthState();
}

export async function refreshToken(): Promise<string | null> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      clearAuthState();
      return null;
    }

    const data = await response.json();
    const newToken = data.data.token;
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    return newToken;
  } catch {
    clearAuthState();
    return null;
  }
}
