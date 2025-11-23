import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi, User, RegisterData } from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

/**
 * Authentication Service
 * Handles login, registration, token management, and biometric authentication
 */
class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await authApi.login(email, password);

    if (!response.success) {
      return { success: false, error: response.error };
    }

    await this.storeCredentials(response.data.token, response.data.user);
    return { success: true, user: response.data.user };
  }

  /**
   * Register a new account
   */
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await authApi.register(data);

    if (!response.success) {
      return { success: false, error: response.error };
    }

    await this.storeCredentials(response.data.token, response.data.user);
    return { success: true, user: response.data.user };
  }

  /**
   * Logout and clear all stored credentials
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Continue with local logout even if API fails
    }

    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<boolean> {
    const response = await authApi.resetPassword(email);
    return response.success;
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Refresh user data from the server
   */
  async refreshUser(): Promise<User | null> {
    const response = await authApi.me();

    if (response.success) {
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(response.data));
      return response.data;
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return !!token;
  }

  /**
   * Store authentication credentials securely
   */
  private async storeCredentials(token: string, user: User): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometrics(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    return true;
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometrics(): Promise<void> {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(
    reason: string = 'Authenticate to continue'
  ): Promise<boolean> {
    const isEnabled = await this.isBiometricEnabled();
    if (!isEnabled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  }

  /**
   * Login with biometrics (for returning users)
   */
  async loginWithBiometrics(): Promise<{ success: boolean; user?: User; error?: string }> {
    const authenticated = await this.authenticateWithBiometrics('Sign in with biometrics');

    if (!authenticated) {
      return { success: false, error: 'Biometric authentication failed' };
    }

    const user = await this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'No stored user found' };
    }

    // Verify the stored token is still valid
    const response = await authApi.me();
    if (!response.success) {
      return { success: false, error: 'Session expired. Please login again.' };
    }

    return { success: true, user: response.data };
  }
}

export const authService = new AuthService();
export default authService;
