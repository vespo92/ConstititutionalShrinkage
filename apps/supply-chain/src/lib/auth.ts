import type { User, AuthState } from '@/types';

const AUTH_STORAGE_KEY = 'supply_chain_auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    // Initialize from storage on client side
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        this.authState.isLoading = false;
      }
    } catch {
      this.authState.isLoading = false;
    }
    this.notifyListeners();
  }

  private saveToStorage(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.authState);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AuthState {
    return this.authState;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // In production, this would call the auth API
    // For now, simulate a login with mock data
    const mockUser: User = {
      id: 'user-1',
      email: credentials.email,
      name: credentials.email.split('@')[0],
      role: credentials.email.includes('admin') ? 'admin' :
            credentials.email.includes('auditor') ? 'auditor' :
            credentials.email.includes('business') ? 'business' : 'public',
      permissions: this.getPermissionsForRole(
        credentials.email.includes('admin') ? 'admin' :
        credentials.email.includes('auditor') ? 'auditor' :
        credentials.email.includes('business') ? 'business' : 'public'
      ),
    };

    this.authState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    };

    this.saveToStorage(mockUser);
    this.notifyListeners();

    return mockUser;
  }

  async register(data: RegisterData): Promise<User> {
    // In production, this would call the auth API
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'public',
      organizationId: data.organizationId,
      permissions: this.getPermissionsForRole('public'),
    };

    this.authState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    };

    this.saveToStorage(mockUser);
    this.notifyListeners();

    return mockUser;
  }

  async logout(): Promise<void> {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    this.clearStorage();
    this.notifyListeners();
  }

  hasPermission(permission: string): boolean {
    return this.authState.user?.permissions.includes(permission) ?? false;
  }

  hasRole(role: User['role']): boolean {
    return this.authState.user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isAuditor(): boolean {
    return this.hasRole('auditor') || this.isAdmin();
  }

  isBusiness(): boolean {
    return this.hasRole('business') || this.isAuditor();
  }

  private getPermissionsForRole(role: User['role']): string[] {
    const basePermissions = [
      'view:transparency_reports',
      'view:product_tracking',
      'view:supply_chains',
    ];

    const businessPermissions = [
      ...basePermissions,
      'manage:own_supply_chain',
      'create:transparency_report',
      'view:own_taxes',
    ];

    const auditorPermissions = [
      ...businessPermissions,
      'verify:supply_chains',
      'audit:organizations',
      'view:all_taxes',
    ];

    const adminPermissions = [
      ...auditorPermissions,
      'manage:tax_rates',
      'manage:exemptions',
      'manage:users',
      'manage:all_supply_chains',
    ];

    switch (role) {
      case 'admin':
        return adminPermissions;
      case 'auditor':
        return auditorPermissions;
      case 'business':
        return businessPermissions;
      default:
        return basePermissions;
    }
  }
}

export const authService = new AuthService();
