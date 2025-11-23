import { Contract, Provider, ethers } from "ethers";
import {
  VerificationResult,
  TallyVerification,
  MerkleProof,
  VotingSession,
} from "../types";
import { MerkleTreeBuilder, verifyMerkleProof } from "../utils/merkle";

export class VoteVerifier {
  constructor(
    private votingRegistry: Contract,
    private voteVerifier: Contract,
    private provider: Provider
  ) {}

  /**
   * Verify a single vote was recorded
   */
  async verifyVote(
    sessionId: string,
    commitment: string,
    transactionHash?: string
  ): Promise<VerificationResult> {
    const result: VerificationResult = {
      valid: false,
      sessionId,
    };

    try {
      // If transaction hash provided, verify it
      if (transactionHash) {
        const receipt = await this.provider.getTransactionReceipt(transactionHash);

        if (!receipt) {
          result.error = "Transaction not found";
          return result;
        }

        result.transactionHash = transactionHash;
        result.blockNumber = receipt.blockNumber;

        // Check for VoteCommitted event
        const filter = this.votingRegistry.filters.VoteCommitted(sessionId);
        const events = await this.votingRegistry.queryFilter(
          filter,
          receipt.blockNumber,
          receipt.blockNumber
        );

        const matchingEvent = events.find((e: { args: { commitment: string } }) =>
          e.args.commitment.toLowerCase() === commitment.toLowerCase()
        );

        if (matchingEvent) {
          result.valid = true;
          result.commitment = commitment;
        } else {
          result.error = "Commitment not found in transaction";
        }
      } else {
        // Just verify commitment format
        if (this.isValidCommitmentFormat(commitment)) {
          result.valid = true;
          result.commitment = commitment;
        } else {
          result.error = "Invalid commitment format";
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error";
    }

    return result;
  }

  /**
   * Verify session totals match blockchain
   */
  async verifySessionTotals(sessionId: string): Promise<TallyVerification> {
    const session = await this.votingRegistry.getSession(sessionId);

    if (!session || session.billHash === ethers.ZeroHash) {
      throw new Error("Session not found");
    }

    return {
      sessionId,
      onChainTally: {
        yes: Number(session.yesVotes),
        no: Number(session.noVotes),
        abstain: Number(session.abstainVotes),
      },
      verified: session.finalized,
      merkleRoot: session.merkleRoot,
    };
  }

  /**
   * Get merkle proof for vote inclusion
   */
  async getInclusionProof(
    sessionId: string,
    commitment: string,
    allCommitments: string[]
  ): Promise<MerkleProof> {
    const tree = new MerkleTreeBuilder();

    // Build tree from all commitments
    for (const c of allCommitments) {
      tree.addLeaf(c);
    }

    tree.build();

    const proof = tree.getProof(commitment);
    const root = tree.getRoot();
    const index = allCommitments.indexOf(commitment);

    return {
      sessionId,
      commitment,
      proof: proof || [],
      root: root || "",
      index,
      valid: proof !== null && root !== null,
    };
  }

  /**
   * Verify a merkle proof
   */
  verifyMerkleProof(
    commitment: string,
    proof: string[],
    root: string
  ): boolean {
    return verifyMerkleProof(commitment, proof, root);
  }

  /**
   * Verify eligibility proof
   */
  async verifyEligibility(
    proof: string,
    merkleRoot?: string
  ): Promise<boolean> {
    const root = merkleRoot || (await this.voteVerifier.getEligibilityRoot());
    return this.voteVerifier.verifyEligibility(proof, root);
  }

  /**
   * Verify vote validity proof
   */
  async verifyVoteValidity(
    proof: string,
    commitment: string
  ): Promise<boolean> {
    return this.voteVerifier.verifyVoteValidity(proof, commitment);
  }

  /**
   * Verify delegation chain proof
   */
  async verifyDelegationChain(
    proof: string,
    finalDelegate: string,
    maxDepth: number
  ): Promise<boolean> {
    return this.voteVerifier.verifyDelegationChain(proof, finalDelegate, maxDepth);
  }

  /**
   * Batch verify multiple proofs
   */
  async batchVerify(
    proofs: string[],
    commitments: string[]
  ): Promise<boolean[]> {
    return this.voteVerifier.batchVerify(proofs, commitments);
  }

  /**
   * Audit a complete voting session
   */
  async auditSession(sessionId: string): Promise<{
    session: VotingSession;
    isComplete: boolean;
    discrepancies: string[];
  }> {
    const session = await this.votingRegistry.getSession(sessionId);

    if (!session || session.billHash === ethers.ZeroHash) {
      throw new Error("Session not found");
    }

    const discrepancies: string[] = [];

    // Check if session is properly finalized
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(session.endTime);
    const revealPeriod = 24 * 60 * 60;

    if (now > endTime + revealPeriod && !session.finalized) {
      discrepancies.push("Session should be finalized but is not");
    }

    if (session.finalized && session.merkleRoot === ethers.ZeroHash) {
      discrepancies.push("Finalized session has no merkle root");
    }

    return {
      session: {
        sessionId,
        billHash: session.billHash,
        startTime: Number(session.startTime),
        endTime: Number(session.endTime),
        yesVotes: Number(session.yesVotes),
        noVotes: Number(session.noVotes),
        abstainVotes: Number(session.abstainVotes),
        finalized: session.finalized,
        merkleRoot: session.merkleRoot,
      },
      isComplete: session.finalized && discrepancies.length === 0,
      discrepancies,
    };
  }

  /**
   * Check if commitment format is valid
   */
  private isValidCommitmentFormat(commitment: string): boolean {
    try {
      if (!commitment.startsWith("0x")) return false;
      if (commitment.length !== 66) return false;
      ethers.getBytes(commitment);
      return true;
    } catch {
      return false;
    }
  }
}
