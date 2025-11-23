import { ethers } from "ethers";
import { VoteChoice, VoteReceipt } from "../types";
import { ethereumService } from "./ethereum";
import { merkleService } from "./merkle";
import { zkProofService } from "./zk-proofs";

interface CommitmentData {
  sessionId: string;
  commitment: string;
  salt: string;
  nullifier: string;
  choice: VoteChoice;
  timestamp: number;
}

class CommitmentService {
  // In-memory store for pending reveals (in production, use Redis or database)
  private pendingReveals: Map<string, CommitmentData> = new Map();

  /**
   * Creates a new vote commitment
   */
  async createCommitment(
    sessionId: string,
    choice: VoteChoice,
    citizenId: string
  ): Promise<{
    commitment: string;
    salt: string;
    nullifier: string;
    proof: string;
  }> {
    // Generate cryptographic values
    const salt = zkProofService.generateSalt();
    const secret = ethers.hexlify(ethers.randomBytes(32));
    const nullifier = zkProofService.computeNullifier(citizenId, sessionId, secret);
    const commitment = zkProofService.computeCommitment(choice, salt, nullifier);

    // Generate eligibility proof
    const eligibilityRoot = await ethereumService.getEligibilityRoot();
    const eligibilityProof = await zkProofService.generateEligibilityProof(
      citizenId,
      [], // Merkle proof would be provided in production
      eligibilityRoot
    );

    // Store for later reveal
    const key = `${sessionId}:${commitment}`;
    this.pendingReveals.set(key, {
      sessionId,
      commitment,
      salt,
      nullifier,
      choice,
      timestamp: Date.now(),
    });

    return {
      commitment,
      salt,
      nullifier,
      proof: eligibilityProof.proof,
    };
  }

  /**
   * Submits a vote commitment to the blockchain
   */
  async submitCommitment(
    sessionId: string,
    commitment: string,
    eligibilityProof: string
  ): Promise<VoteReceipt> {
    // Submit to blockchain
    const txHash = await ethereumService.commitVote(
      sessionId,
      commitment,
      eligibilityProof
    );

    // Get transaction details
    const receipt = await ethereumService.getTransactionReceipt(txHash);

    // Add to merkle tree
    merkleService.addCommitment(sessionId, commitment);

    return {
      sessionId,
      commitment,
      transactionHash: txHash,
      blockNumber: receipt?.blockNumber || 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Reveals a previously committed vote
   */
  async revealVote(
    sessionId: string,
    commitment: string
  ): Promise<string> {
    const key = `${sessionId}:${commitment}`;
    const data = this.pendingReveals.get(key);

    if (!data) {
      throw new Error("No pending reveal found for this commitment");
    }

    // Submit reveal to blockchain
    const txHash = await ethereumService.revealVote(
      sessionId,
      data.choice,
      data.salt,
      data.nullifier
    );

    // Clean up
    this.pendingReveals.delete(key);

    return txHash;
  }

  /**
   * Retrieves commitment data for reveal
   */
  getPendingReveal(sessionId: string, commitment: string): CommitmentData | null {
    const key = `${sessionId}:${commitment}`;
    return this.pendingReveals.get(key) || null;
  }

  /**
   * Verifies a commitment matches the expected format
   */
  verifyCommitmentFormat(commitment: string): boolean {
    try {
      if (!commitment.startsWith("0x")) return false;
      if (commitment.length !== 66) return false; // 0x + 64 hex chars
      ethers.getBytes(commitment);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch verify multiple commitments
   */
  async batchVerifyCommitments(
    sessionId: string,
    commitments: string[]
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const commitment of commitments) {
      const isValid = this.verifyCommitmentFormat(commitment);
      results.set(commitment, isValid);
    }

    return results;
  }

  /**
   * Gets all pending reveals for a session
   */
  getPendingRevealsForSession(sessionId: string): CommitmentData[] {
    const results: CommitmentData[] = [];

    for (const [key, data] of this.pendingReveals) {
      if (key.startsWith(`${sessionId}:`)) {
        results.push(data);
      }
    }

    return results;
  }

  /**
   * Cleans up expired pending reveals
   */
  cleanupExpiredReveals(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, data] of this.pendingReveals) {
      if (now - data.timestamp > maxAgeMs) {
        this.pendingReveals.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const commitmentService = new CommitmentService();
