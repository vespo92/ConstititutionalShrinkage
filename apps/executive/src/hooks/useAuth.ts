'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole } from '@/types';
import {
  getAuthState,
  login as authLogin,
  logout as authLogout,
  hasRole,
  hasPermission,
  isExecutive,
} from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isExecutive: boolean;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser, isAuthenticated } = getAuthState();
    setUser(storedUser);
    setIsLoading(false);

    if (!isAuthenticated && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        router.push('/login');
      }
    }
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authLogin(email, password);
      setUser(loggedInUser);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authLogout();
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkRole = useCallback((roles: UserRole[]) => {
    return hasRole(user, roles);
  }, [user]);

  const checkPermission = useCallback((permission: string) => {
    return hasPermission(user, permission);
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole: checkRole,
    hasPermission: checkPermission,
    isExecutive: isExecutive(user),
  };
}

export default useAuth;
