'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type RegisterData } from '@/lib/auth';
import type { AuthState, User } from '@/types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    return authService.login(credentials);
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    return authService.register(data);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    return authService.logout();
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    return authService.hasPermission(permission);
  }, []);

  const hasRole = useCallback((role: User['role']): boolean => {
    return authService.hasRole(role);
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    isAdmin: authService.isAdmin(),
    isAuditor: authService.isAuditor(),
    isBusiness: authService.isBusiness(),
  };
}
