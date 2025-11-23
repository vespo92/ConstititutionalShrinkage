import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth';
import { RegisterData } from '@/services/api';

/**
 * useAuth Hook
 * Provides authentication state and actions
 */
export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setLoading,
    setError,
    clearAuth,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const result = await authService.login(email, password);

      setLoading(false);

      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }

      setError(result.error || 'Login failed');
      return false;
    },
    [setLoading, setError, setUser]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const result = await authService.register(data);

      setLoading(false);

      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }

      setError(result.error || 'Registration failed');
      return false;
    },
    [setLoading, setError, setUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    await authService.logout();
    clearAuth();
    setLoading(false);
  }, [setLoading, clearAuth]);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await authService.loginWithBiometrics();

    setLoading(false);

    if (result.success && result.user) {
      setUser(result.user);
      return true;
    }

    setError(result.error || 'Biometric login failed');
    return false;
  }, [setLoading, setError, setUser]);

  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const success = await authService.resetPassword(email);

      setLoading(false);

      if (!success) {
        setError('Failed to send reset email');
      }

      return success;
    },
    [setLoading, setError]
  );

  const refreshUser = useCallback(async (): Promise<void> => {
    const updatedUser = await authService.refreshUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [setUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    loginWithBiometrics,
    resetPassword,
    refreshUser,
  };
}

export default useAuth;
