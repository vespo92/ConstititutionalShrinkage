'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { RegionalUser, UserRole, Permission } from '@/types';

interface AuthContextValue {
  user: RegionalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock user for development
const mockUser: RegionalUser = {
  id: 'user-1',
  name: 'Alex Thompson',
  email: 'alex@example.com',
  avatar: undefined,
  primaryPod: 'pod-ca-sf',
  memberPods: ['pod-ca-sf', 'pod-wa-sea'],
  role: 'pod_member',
  permissions: ['view_pods', 'vote_local', 'vote_regional'],
  joinedAt: new Date('2024-01-15'),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<RegionalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    const roleHierarchy: Record<UserRole, number> = {
      citizen: 1,
      pod_member: 2,
      pod_leadership: 3,
      regional_coordinator: 4,
      admin: 5,
    };
    return roleHierarchy[user.role] >= roleHierarchy[role];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
