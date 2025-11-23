import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Provides secure and regular storage for different data types
 */

// Keys for secure storage (sensitive data)
const SECURE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  VOTE_SIGNING_KEY: 'vote_signing_key',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USER_DATA: 'user_data',
};

// Keys for regular storage (non-sensitive data)
const STORAGE_KEYS = {
  OFFLINE_BILLS: 'offline_bills',
  OFFLINE_VOTES: 'offline_vote_queue',
  PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync_timestamp',
  CACHED_SESSIONS: 'cached_voting_sessions',
  THEME: 'app_theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
};

/**
 * Secure Storage - for sensitive data
 * Uses expo-secure-store (Keychain on iOS, Keystore on Android)
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error reading from secure storage: ${key}`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to secure storage: ${key}`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error removing from secure storage: ${key}`, error);
      return false;
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  async setJSON(key: string, value: unknown): Promise<boolean> {
    return this.set(key, JSON.stringify(value));
  },
};

/**
 * Regular Storage - for non-sensitive data
 * Uses AsyncStorage for larger data and caching
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
      return false;
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  async setJSON(key: string, value: unknown): Promise<boolean> {
    return this.set(key, JSON.stringify(value));
  },

  async multiGet(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return Object.fromEntries(pairs);
    } catch (error) {
      console.error('Error reading multiple keys from storage', error);
      return {};
    }
  },

  async multiSet(pairs: [string, string][]): Promise<boolean> {
    try {
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error writing multiple keys to storage', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage', error);
      return false;
    }
  },
};

/**
 * Offline Vote Queue - for storing votes when offline
 */
export interface QueuedVote {
  sessionId: string;
  vote: 'yea' | 'nay' | 'abstain';
  timestamp: string;
  signature?: string;
}

export const offlineVoteQueue = {
  async add(vote: QueuedVote): Promise<void> {
    const queue = await this.getAll();
    queue.push(vote);
    await storage.setJSON(STORAGE_KEYS.OFFLINE_VOTES, queue);
  },

  async getAll(): Promise<QueuedVote[]> {
    return (await storage.getJSON<QueuedVote[]>(STORAGE_KEYS.OFFLINE_VOTES)) || [];
  },

  async remove(sessionId: string): Promise<void> {
    const queue = await this.getAll();
    const filtered = queue.filter((v) => v.sessionId !== sessionId);
    await storage.setJSON(STORAGE_KEYS.OFFLINE_VOTES, filtered);
  },

  async clear(): Promise<void> {
    await storage.remove(STORAGE_KEYS.OFFLINE_VOTES);
  },

  async count(): Promise<number> {
    const queue = await this.getAll();
    return queue.length;
  },
};

/**
 * User Preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    votes: boolean;
    bills: boolean;
    delegations: boolean;
  };
  region?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: {
    votes: true,
    bills: true,
    delegations: true,
  },
};

export const preferences = {
  async get(): Promise<UserPreferences> {
    const prefs = await storage.getJSON<UserPreferences>(STORAGE_KEYS.PREFERENCES);
    return { ...DEFAULT_PREFERENCES, ...prefs };
  },

  async set(prefs: Partial<UserPreferences>): Promise<void> {
    const current = await this.get();
    await storage.setJSON(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
  },

  async reset(): Promise<void> {
    await storage.setJSON(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },
};

export { SECURE_KEYS, STORAGE_KEYS };
