import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { ApiKey, RateLimitTier, RATE_LIMIT_TIERS } from '../types';

// In-memory store for demo - replace with database in production
const apiKeys = new Map<string, ApiKey>();

/**
 * Service for managing API keys
 */
export const apiKeyService = {
  /**
   * Generate a new API key
   */
  async createKey(params: {
    name: string;
    tier: RateLimitTier;
    organizationId?: string;
    permissions?: string[];
    expiresAt?: Date;
  }): Promise<{ apiKey: ApiKey; rawKey: string }> {
    // Generate a secure random key
    const rawKey = `csk_${randomBytes(32).toString('base64url')}`;
    const keyHash = hashKey(rawKey);

    const apiKey: ApiKey = {
      id: uuidv4(),
      key: keyHash,
      name: params.name,
      tier: params.tier,
      organizationId: params.organizationId,
      permissions: params.permissions || ['read:bills', 'read:votes', 'read:regions', 'read:metrics'],
      rateLimit: RATE_LIMIT_TIERS[params.tier],
      createdAt: new Date(),
      expiresAt: params.expiresAt,
      isActive: true,
    };

    apiKeys.set(keyHash, apiKey);

    // Return raw key only once - it cannot be retrieved later
    return { apiKey, rawKey };
  },

  /**
   * Validate an API key
   */
  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const keyHash = hashKey(rawKey);
    const apiKey = apiKeys.get(keyHash);

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    return apiKey;
  },

  /**
   * Get API key by ID
   */
  async getById(id: string): Promise<ApiKey | null> {
    for (const key of apiKeys.values()) {
      if (key.id === id) {
        return key;
      }
    }
    return null;
  },

  /**
   * List API keys for an organization
   */
  async listByOrganization(organizationId: string): Promise<ApiKey[]> {
    const keys: ApiKey[] = [];
    for (const key of apiKeys.values()) {
      if (key.organizationId === organizationId) {
        keys.push({ ...key, key: maskKey(key.key) });
      }
    }
    return keys;
  },

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    for (const key of apiKeys.values()) {
      if (key.id === id) {
        key.lastUsedAt = new Date();
        break;
      }
    }
  },

  /**
   * Revoke an API key
   */
  async revokeKey(id: string): Promise<boolean> {
    for (const key of apiKeys.values()) {
      if (key.id === id) {
        key.isActive = false;
        return true;
      }
    }
    return false;
  },

  /**
   * Update API key permissions
   */
  async updatePermissions(id: string, permissions: string[]): Promise<ApiKey | null> {
    for (const key of apiKeys.values()) {
      if (key.id === id) {
        key.permissions = permissions;
        return key;
      }
    }
    return null;
  },

  /**
   * Upgrade API key tier
   */
  async upgradeTier(id: string, tier: RateLimitTier): Promise<ApiKey | null> {
    for (const key of apiKeys.values()) {
      if (key.id === id) {
        key.tier = tier;
        key.rateLimit = RATE_LIMIT_TIERS[tier];
        return key;
      }
    }
    return null;
  },
};

/**
 * Hash API key for secure storage
 */
function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Mask API key for display
 */
function maskKey(hash: string): string {
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 4)}`;
}
