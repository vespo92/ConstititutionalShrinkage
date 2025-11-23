/**
 * Secrets Management
 *
 * Interface for HashiCorp Vault and local secret management.
 */

import crypto from 'node:crypto';
import type { Secret, VaultPolicy } from '../types/index.js';

interface VaultClient {
  read(path: string): Promise<Record<string, unknown>>;
  write(path: string, data: Record<string, unknown>): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<string[]>;
}

// In-memory secret store for development/testing
const localSecrets = new Map<string, { value: string; version: number; expiresAt?: Date }>();

/**
 * Vault configuration
 */
const vaultConfig = {
  address: process.env.VAULT_ADDR || 'http://localhost:8200',
  token: process.env.VAULT_TOKEN,
  namespace: process.env.VAULT_NAMESPACE,
};

/**
 * Check if Vault is configured
 */
function isVaultConfigured(): boolean {
  return !!(vaultConfig.address && vaultConfig.token);
}

/**
 * Create Vault client (mock for now, would use actual vault client in production)
 */
function createVaultClient(): VaultClient | null {
  if (!isVaultConfigured()) {
    return null;
  }

  // In a real implementation, this would use the official Vault client
  return {
    async read(path: string) {
      // Mock implementation
      const response = await fetch(`${vaultConfig.address}/v1/${path}`, {
        headers: {
          'X-Vault-Token': vaultConfig.token!,
          ...(vaultConfig.namespace && { 'X-Vault-Namespace': vaultConfig.namespace }),
        },
      });
      if (!response.ok) {
        throw new Error(`Vault read failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data as Record<string, unknown>;
    },

    async write(path: string, data: Record<string, unknown>) {
      const response = await fetch(`${vaultConfig.address}/v1/${path}`, {
        method: 'POST',
        headers: {
          'X-Vault-Token': vaultConfig.token!,
          'Content-Type': 'application/json',
          ...(vaultConfig.namespace && { 'X-Vault-Namespace': vaultConfig.namespace }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Vault write failed: ${response.statusText}`);
      }
    },

    async delete(path: string) {
      const response = await fetch(`${vaultConfig.address}/v1/${path}`, {
        method: 'DELETE',
        headers: {
          'X-Vault-Token': vaultConfig.token!,
          ...(vaultConfig.namespace && { 'X-Vault-Namespace': vaultConfig.namespace }),
        },
      });
      if (!response.ok) {
        throw new Error(`Vault delete failed: ${response.statusText}`);
      }
    },

    async list(path: string) {
      const response = await fetch(`${vaultConfig.address}/v1/${path}?list=true`, {
        headers: {
          'X-Vault-Token': vaultConfig.token!,
          ...(vaultConfig.namespace && { 'X-Vault-Namespace': vaultConfig.namespace }),
        },
      });
      if (!response.ok) {
        throw new Error(`Vault list failed: ${response.statusText}`);
      }
      const data = await response.json();
      return (data.data?.keys || []) as string[];
    },
  };
}

const vaultClient = createVaultClient();

/**
 * Get a secret value
 */
export async function getSecret(key: string): Promise<string | null> {
  if (vaultClient) {
    try {
      const data = await vaultClient.read(`secret/data/${key}`);
      return data.value as string;
    } catch {
      return null;
    }
  }

  // Local fallback
  const secret = localSecrets.get(key);
  if (!secret) return null;

  if (secret.expiresAt && secret.expiresAt < new Date()) {
    localSecrets.delete(key);
    return null;
  }

  return secret.value;
}

/**
 * Set a secret value
 */
export async function setSecret(
  key: string,
  value: string,
  options?: { expiresIn?: number }
): Promise<void> {
  if (vaultClient) {
    await vaultClient.write(`secret/data/${key}`, {
      data: { value },
      options: options?.expiresIn ? { ttl: `${options.expiresIn}s` } : undefined,
    });
    return;
  }

  // Local fallback
  const existing = localSecrets.get(key);
  localSecrets.set(key, {
    value,
    version: (existing?.version || 0) + 1,
    expiresAt: options?.expiresIn
      ? new Date(Date.now() + options.expiresIn * 1000)
      : undefined,
  });
}

/**
 * Delete a secret
 */
export async function deleteSecret(key: string): Promise<void> {
  if (vaultClient) {
    await vaultClient.delete(`secret/data/${key}`);
    return;
  }

  localSecrets.delete(key);
}

/**
 * List secrets (keys only)
 */
export async function listSecrets(prefix?: string): Promise<string[]> {
  if (vaultClient) {
    const path = prefix ? `secret/metadata/${prefix}` : 'secret/metadata';
    return vaultClient.list(path);
  }

  const keys = Array.from(localSecrets.keys());
  return prefix ? keys.filter((k) => k.startsWith(prefix)) : keys;
}

/**
 * Rotate a secret
 */
export async function rotateSecret(
  key: string,
  generator: () => string = () => crypto.randomBytes(32).toString('hex')
): Promise<string> {
  const newValue = generator();
  await setSecret(key, newValue);
  return newValue;
}

/**
 * Get secret metadata
 */
export async function getSecretMetadata(key: string): Promise<Secret | null> {
  if (vaultClient) {
    try {
      const data = await vaultClient.read(`secret/metadata/${key}`);
      return {
        key,
        version: data.current_version as number,
        createdAt: new Date(data.created_time as string),
        expiresAt: data.delete_version_after
          ? new Date(Date.now() + (data.delete_version_after as number) * 1000)
          : undefined,
      };
    } catch {
      return null;
    }
  }

  const secret = localSecrets.get(key);
  if (!secret) return null;

  return {
    key,
    version: secret.version,
    createdAt: new Date(),
    expiresAt: secret.expiresAt,
  };
}

/**
 * Validate Vault policy structure
 */
export function validatePolicy(policy: VaultPolicy): boolean {
  const validCapabilities = ['create', 'read', 'update', 'delete', 'list'];

  if (!policy.name || !policy.path) {
    return false;
  }

  return policy.capabilities.every((cap) => validCapabilities.includes(cap));
}

/**
 * Generate a database credential from Vault dynamic secrets
 */
export async function getDatabaseCredentials(
  role: string
): Promise<{ username: string; password: string } | null> {
  if (!vaultClient) {
    // Development fallback
    return {
      username: 'dev_user',
      password: 'dev_password',
    };
  }

  try {
    const data = await vaultClient.read(`database/creds/${role}`);
    return {
      username: data.username as string,
      password: data.password as string,
    };
  } catch {
    return null;
  }
}

/**
 * Encrypt data using Vault transit engine
 */
export async function transitEncrypt(keyName: string, plaintext: string): Promise<string> {
  if (!vaultClient) {
    // Development fallback - use local encryption
    const { encrypt } = await import('./crypto.js');
    return encrypt(plaintext);
  }

  const data = await vaultClient.read(`transit/encrypt/${keyName}`);
  await vaultClient.write(`transit/encrypt/${keyName}`, {
    plaintext: Buffer.from(plaintext).toString('base64'),
  });
  return data.ciphertext as string;
}

/**
 * Decrypt data using Vault transit engine
 */
export async function transitDecrypt(keyName: string, ciphertext: string): Promise<string> {
  if (!vaultClient) {
    // Development fallback - use local decryption
    const { decrypt } = await import('./crypto.js');
    return decrypt(ciphertext);
  }

  await vaultClient.write(`transit/decrypt/${keyName}`, { ciphertext });
  const data = await vaultClient.read(`transit/decrypt/${keyName}`);
  return Buffer.from(data.plaintext as string, 'base64').toString();
}
