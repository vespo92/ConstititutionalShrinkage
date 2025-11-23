import { ethers } from "ethers";
import { VoteChoice } from "../types";

/**
 * Hash a string using keccak256
 */
export function hashData(data: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

/**
 * Hash bytes using keccak256
 */
export function hashBytes(data: Uint8Array): string {
  return ethers.keccak256(data);
}

/**
 * Compute a vote commitment from choice, salt, and nullifier
 */
export function computeCommitment(
  choice: VoteChoice,
  salt: string,
  nullifier: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["uint8", "bytes32", "bytes32"],
      [choice, salt, nullifier]
    )
  );
}

/**
 * Hash an address
 */
export function hashAddress(address: string): string {
  return ethers.keccak256(ethers.solidityPacked(["address"], [address]));
}

/**
 * Hash multiple values together
 */
export function hashMultiple(...values: string[]): string {
  const types = values.map(() => "bytes32");
  return ethers.keccak256(ethers.solidityPacked(types, values));
}

/**
 * Generate a random bytes32 value
 */
export function randomBytes32(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Verify a hash matches expected data
 */
export function verifyHash(data: string, expectedHash: string): boolean {
  const computedHash = hashData(data);
  return computedHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Convert a string to bytes32 (padded or truncated)
 */
export function stringToBytes32(str: string): string {
  const bytes = ethers.toUtf8Bytes(str);
  if (bytes.length > 32) {
    return ethers.hexlify(bytes.slice(0, 32));
  }
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return ethers.hexlify(padded);
}

/**
 * Convert bytes32 to string (trimming null bytes)
 */
export function bytes32ToString(bytes32: string): string {
  const bytes = ethers.getBytes(bytes32);
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end--;
  }
  return ethers.toUtf8String(bytes.slice(0, end));
}
