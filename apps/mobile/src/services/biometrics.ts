import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Biometrics Service
 * Handles Face ID / Touch ID authentication
 */

export type BiometricType = 'facial' | 'fingerprint' | 'iris' | 'none';

class BiometricsService {
  private _isAvailable: boolean | null = null;
  private _biometricType: BiometricType = 'none';

  /**
   * Initialize and check biometric availability
   */
  async initialize(): Promise<void> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    this._isAvailable = hasHardware && isEnrolled;

    if (this._isAvailable) {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        this._biometricType = 'facial';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        this._biometricType = 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        this._biometricType = 'iris';
      }
    }
  }

  /**
   * Check if biometrics are available
   */
  get isAvailable(): boolean {
    return this._isAvailable ?? false;
  }

  /**
   * Get the type of biometric authentication available
   */
  get biometricType(): BiometricType {
    return this._biometricType;
  }

  /**
   * Get human-readable name for the biometric type
   */
  get biometricName(): string {
    switch (this._biometricType) {
      case 'facial':
        return 'Face ID';
      case 'fingerprint':
        return 'Touch ID';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometrics';
    }
  }

  /**
   * Get the security level of the device
   */
  async getSecurityLevel(): Promise<LocalAuthentication.SecurityLevel> {
    return await LocalAuthentication.getEnrolledLevelAsync();
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(
    options: {
      promptMessage?: string;
      cancelLabel?: string;
      fallbackLabel?: string;
      disableFallback?: boolean;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    if (!this._isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    const {
      promptMessage = 'Authenticate to continue',
      cancelLabel = 'Cancel',
      fallbackLabel = 'Use passcode',
      disableFallback = false,
    } = options;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback: disableFallback,
      });

      if (result.success) {
        return { success: true };
      }

      let error = 'Authentication failed';
      if (result.error === 'user_cancel') {
        error = 'Authentication cancelled';
      } else if (result.error === 'user_fallback') {
        error = 'User chose fallback';
      } else if (result.error === 'lockout') {
        error = 'Too many attempts. Try again later.';
      }

      return { success: false, error };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Authenticate for vote confirmation
   */
  async authenticateForVote(): Promise<{ success: boolean; error?: string }> {
    return this.authenticate({
      promptMessage: 'Confirm your vote with biometrics',
      fallbackLabel: 'Use passcode to confirm',
    });
  }

  /**
   * Authenticate for login
   */
  async authenticateForLogin(): Promise<{ success: boolean; error?: string }> {
    return this.authenticate({
      promptMessage: 'Sign in with biometrics',
      fallbackLabel: 'Use passcode',
    });
  }

  /**
   * Authenticate for sensitive action
   */
  async authenticateForSensitiveAction(
    action: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.authenticate({
      promptMessage: `Authenticate to ${action}`,
      disableFallback: true,
    });
  }
}

export const biometricsService = new BiometricsService();
export default biometricsService;
