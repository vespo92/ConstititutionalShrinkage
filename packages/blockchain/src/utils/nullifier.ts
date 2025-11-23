import { ethers } from "ethers";

/**
 * Generate a random nullifier
 */
export function generateNullifier(
  citizenId: string,
  sessionId: string,
  secret: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["string", "bytes32", "bytes32"],
      [citizenId, sessionId, ethers.keccak256(ethers.toUtf8Bytes(secret))]
    )
  );
}

/**
 * Compute nullifier from a secret
 */
export function computeNullifierFromSecret(
  secret: string,
  domain: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["bytes32", "bytes32"],
      [
        ethers.keccak256(ethers.toUtf8Bytes(secret)),
        ethers.keccak256(ethers.toUtf8Bytes(domain)),
      ]
    )
  );
}

/**
 * Generate a random nullifier (no inputs)
 */
export function randomNullifier(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Derive a nullifier from multiple inputs
 */
export function deriveNullifier(...inputs: string[]): string {
  const hashes = inputs.map((i) => ethers.keccak256(ethers.toUtf8Bytes(i)));
  return ethers.keccak256(
    ethers.solidityPacked(
      hashes.map(() => "bytes32"),
      hashes
    )
  );
}

/**
 * Check if a nullifier has valid format
 */
export function isValidNullifier(nullifier: string): boolean {
  try {
    if (!nullifier.startsWith("0x")) return false;
    if (nullifier.length !== 66) return false;
    ethers.getBytes(nullifier);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a deterministic nullifier from voter identity and session
 * This ensures the same voter can only vote once per session
 */
export function generateDeterministicNullifier(
  voterIdentifier: string,
  sessionId: string,
  privateSecret: string
): string {
  // First, create a private key from the voter's secret
  const privateKey = ethers.keccak256(ethers.toUtf8Bytes(privateSecret));

  // Then combine with session-specific data
  return ethers.keccak256(
    ethers.solidityPacked(
      ["bytes32", "bytes32", "bytes32"],
      [
        privateKey,
        ethers.keccak256(ethers.toUtf8Bytes(voterIdentifier)),
        sessionId,
      ]
    )
  );
}

/**
 * Split a nullifier into components for ZK proofs
 */
export function splitNullifier(nullifier: string): {
  high: string;
  low: string;
} {
  const bytes = ethers.getBytes(nullifier);
  const high = ethers.hexlify(bytes.slice(0, 16));
  const low = ethers.hexlify(bytes.slice(16, 32));
  return { high, low };
}

/**
 * Combine nullifier components
 */
export function combineNullifier(high: string, low: string): string {
  const highBytes = ethers.getBytes(high);
  const lowBytes = ethers.getBytes(low);
  const combined = new Uint8Array(32);
  combined.set(highBytes, 0);
  combined.set(lowBytes, 16);
  return ethers.hexlify(combined);
}
