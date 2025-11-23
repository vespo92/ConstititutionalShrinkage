import { Contract, ethers } from "ethers";
import { VoteChoice, TransactionResult } from "../types";
import { computeCommitment } from "../utils/hash";

export class VoteRevealer {
  constructor(private votingRegistry: Contract) {}

  /**
   * Reveal a previously committed vote
   */
  async reveal(
    sessionId: string,
    choice: VoteChoice,
    salt: string,
    nullifier: string
  ): Promise<TransactionResult> {
    // Verify the reveal data first
    if (!this.validateRevealData(choice, salt, nullifier)) {
      throw new Error("Invalid reveal data");
    }

    const tx = await this.votingRegistry.revealVote(
      sessionId,
      choice,
      salt,
      nullifier
    );
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmations: await receipt.confirmations(),
      gasUsed: receipt.gasUsed,
    };
  }

  /**
   * Validate reveal data matches expected format
   */
  validateRevealData(
    choice: VoteChoice,
    salt: string,
    nullifier: string
  ): boolean {
    // Validate choice
    if (![VoteChoice.ABSTAIN, VoteChoice.YES, VoteChoice.NO].includes(choice)) {
      return false;
    }

    // Validate salt format
    if (!salt.startsWith("0x") || salt.length !== 66) {
      return false;
    }

    // Validate nullifier format
    if (!nullifier.startsWith("0x") || nullifier.length !== 66) {
      return false;
    }

    try {
      ethers.getBytes(salt);
      ethers.getBytes(nullifier);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify that reveal data matches a commitment
   */
  verifyRevealMatchesCommitment(
    commitment: string,
    choice: VoteChoice,
    salt: string,
    nullifier: string
  ): boolean {
    const expectedCommitment = computeCommitment(choice, salt, nullifier);
    return commitment.toLowerCase() === expectedCommitment.toLowerCase();
  }

  /**
   * Check if a nullifier has been used
   */
  async isNullifierUsed(nullifier: string): Promise<boolean> {
    return this.votingRegistry.isNullifierUsed(nullifier);
  }

  /**
   * Check if reveal period is active for a session
   */
  async isRevealPeriodActive(sessionId: string): Promise<boolean> {
    const session = await this.votingRegistry.getSession(sessionId);

    if (!session || session.billHash === ethers.ZeroHash) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(session.endTime);
    const revealPeriod = 24 * 60 * 60; // 24 hours

    // Reveal period is between endTime and endTime + revealPeriod
    return now > endTime && now <= endTime + revealPeriod;
  }

  /**
   * Get time remaining in reveal period
   */
  async getRevealTimeRemaining(sessionId: string): Promise<number> {
    const session = await this.votingRegistry.getSession(sessionId);

    if (!session || session.billHash === ethers.ZeroHash) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(session.endTime);
    const revealPeriod = 24 * 60 * 60;
    const revealEnd = endTime + revealPeriod;

    if (now > revealEnd) {
      return 0;
    }

    return Math.max(0, revealEnd - now);
  }

  /**
   * Batch reveal multiple votes
   */
  async batchReveal(
    reveals: Array<{
      sessionId: string;
      choice: VoteChoice;
      salt: string;
      nullifier: string;
    }>
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const reveal of reveals) {
      const result = await this.reveal(
        reveal.sessionId,
        reveal.choice,
        reveal.salt,
        reveal.nullifier
      );
      results.push(result);
    }

    return results;
  }
}
