import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const SIGNING_KEY_ID = 'vote_signing_key';

/**
 * Crypto Utilities
 * Handles vote signing and cryptographic operations
 */

/**
 * Generate a random signing key for vote verification
 */
export async function generateSigningKey(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const key = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await SecureStore.setItemAsync(SIGNING_KEY_ID, key);
  return key;
}

/**
 * Get the stored signing key or generate a new one
 */
export async function getOrCreateSigningKey(): Promise<string> {
  const existingKey = await SecureStore.getItemAsync(SIGNING_KEY_ID);

  if (existingKey) {
    return existingKey;
  }

  return generateSigningKey();
}

/**
 * Sign a vote for verification
 */
export async function signVote(
  sessionId: string,
  vote: 'yea' | 'nay' | 'abstain',
  timestamp: string
): Promise<string> {
  const signingKey = await getOrCreateSigningKey();
  const message = `${sessionId}:${vote}:${timestamp}:${signingKey}`;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    message
  );

  return hash;
}

/**
 * Generate a vote receipt hash
 */
export async function generateReceiptHash(
  sessionId: string,
  vote: 'yea' | 'nay' | 'abstain'
): Promise<string> {
  const timestamp = new Date().toISOString();
  const signature = await signVote(sessionId, vote, timestamp);

  return signature.slice(0, 16);
}

/**
 * Generate a random verification code
 */
export async function generateVerificationCode(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(4);
  const code = Array.from(bytes)
    .map((b) => (b % 10).toString())
    .join('');

  return code;
}

/**
 * Hash sensitive data
 */
export async function hashData(data: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
}

/**
 * Generate a unique device identifier
 */
export async function getDeviceId(): Promise<string> {
  const storedId = await SecureStore.getItemAsync('device_id');

  if (storedId) {
    return storedId;
  }

  const bytes = await Crypto.getRandomBytesAsync(16);
  const deviceId = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await SecureStore.setItemAsync('device_id', deviceId);
  return deviceId;
}
