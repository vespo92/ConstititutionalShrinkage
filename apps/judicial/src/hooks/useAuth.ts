'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JudicialUser } from '@/types';

interface AuthState {
  user: JudicialUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Mock user for development
const mockUser: JudicialUser = {
  id: 'judge-001',
  name: 'Justice Smith',
  email: 'j.smith@judicial.gov',
  role: 'judge',
  assignedRegion: 'region-northeast',
  permissions: ['review:read', 'review:write', 'case:read', 'case:write', 'ruling:issue'],
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      try {
        // In production, this would verify the token with the auth service
        await new Promise(resolve => setTimeout(resolve, 500));
        setState({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Authentication failed',
        });
      }
    };

    checkAuth();
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes(permission);
  }, [state.user]);

  const hasRole = useCallback((role: JudicialUser['role']): boolean => {
    if (!state.user) return false;
    return state.user.role === role;
  }, [state.user]);

  const logout = useCallback(async () => {
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    hasPermission,
    hasRole,
    logout,
  };
}
