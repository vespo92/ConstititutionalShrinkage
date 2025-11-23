'use client';

import { useState, useEffect, useCallback } from 'react';
import { VerificationLevel, type Citizen } from '@/lib/types';
import { citizenApi } from '@/lib/api';

interface AuthState {
  user: Citizen | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verificationLevel: VerificationLevel | null;
}

interface UseAuthReturn extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    verificationLevel: null,
  });

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const user = await citizenApi.getProfile();
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        verificationLevel: user.verificationLevel,
      });
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        verificationLevel: null,
      });
    }
  };

  const login = useCallback(async () => {
    // In a real implementation, this would redirect to auth provider
    // For now, we'll simulate loading the profile
    await loadProfile();
  }, []);

  const logout = useCallback(async () => {
    // In a real implementation, this would clear tokens and redirect
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      verificationLevel: null,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshProfile,
  };
}

/**
 * Hook for checking if user has required verification level
 */
export function useVerificationRequired(requiredLevel: VerificationLevel): {
  hasAccess: boolean;
  currentLevel: VerificationLevel | null;
} {
  const { verificationLevel } = useAuth();

  const levelOrder = [
    VerificationLevel.UNVERIFIED,
    VerificationLevel.BASIC,
    VerificationLevel.BIOMETRIC,
    VerificationLevel.FULL,
  ];

  const currentIndex = verificationLevel
    ? levelOrder.indexOf(verificationLevel)
    : -1;
  const requiredIndex = levelOrder.indexOf(requiredLevel);

  return {
    hasAccess: currentIndex >= requiredIndex,
    currentLevel: verificationLevel,
  };
}
