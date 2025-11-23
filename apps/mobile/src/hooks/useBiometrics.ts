import { useState, useEffect, useCallback } from 'react';
import biometricsService, { BiometricType } from '@/services/biometrics';

/**
 * useBiometrics Hook
 * Provides biometric authentication state and actions
 */
export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [biometricName, setBiometricName] = useState('Biometrics');
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = useCallback(async () => {
    await biometricsService.initialize();

    setIsAvailable(biometricsService.isAvailable);
    setBiometricType(biometricsService.biometricType);
    setBiometricName(biometricsService.biometricName);
    setIsInitialized(true);
  }, []);

  const authenticate = useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      if (!isAvailable) return false;

      const result = await biometricsService.authenticate({
        promptMessage,
      });

      return result.success;
    },
    [isAvailable]
  );

  const authenticateForVote = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;

    const result = await biometricsService.authenticateForVote();
    return result.success;
  }, [isAvailable]);

  const authenticateForLogin = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false;

    const result = await biometricsService.authenticateForLogin();
    return result.success;
  }, [isAvailable]);

  const authenticateForSensitiveAction = useCallback(
    async (action: string): Promise<boolean> => {
      if (!isAvailable) return false;

      const result = await biometricsService.authenticateForSensitiveAction(action);
      return result.success;
    },
    [isAvailable]
  );

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isAvailable,
    biometricType,
    biometricName,
    isInitialized,
    authenticate,
    authenticateForVote,
    authenticateForLogin,
    authenticateForSensitiveAction,
  };
}

export default useBiometrics;
