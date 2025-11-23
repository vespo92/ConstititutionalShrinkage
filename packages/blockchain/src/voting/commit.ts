import { Contract, ethers } from "ethers";
import { VoteChoice, VoteReceipt, EligibilityProof } from "../types";
import { computeCommitment } from "../utils/hash";
import { generateNullifier } from "../utils/nullifier";

export class VoteCommitter {
  constructor(
    private votingRegistry: Contract,
    private voteVerifier: Contract
  ) {}

  /**
   * Prepare a vote commitment
   */
  async prepare(
    sessionId: string,
    choice: VoteChoice,
    citizenId: string
  ): Promise<{
    commitment: string;
    salt: string;
    nullifier: string;
  }> {
    // Generate random salt
    const salt = ethers.hexlify(ethers.randomBytes(32));

    // Generate nullifier from citizen ID and session
    const secret = ethers.hexlify(ethers.randomBytes(32));
    const nullifier = generateNullifier(citizenId, sessionId, secret);

    // Compute commitment
    const commitment = computeCommitment(choice, salt, nullifier);

    return {
      commitment,
      salt,
      nullifier,
    };
  }

  /**
   * Generate an eligibility proof
   */
  async generateEligibilityProof(
    citizenId: string,
    merkleProof: string[]
  ): Promise<EligibilityProof> {
    const merkleRoot = await this.voteVerifier.getEligibilityRoot();

    // Generate ZK proof (placeholder - real implementation would use snarkjs)
    const proofData = ethers.concat([
      ethers.randomBytes(32), // a[0]
      ethers.randomBytes(32), // a[1]
      ethers.randomBytes(32), // b[0][0]
      ethers.randomBytes(32), // b[0][1]
      ethers.randomBytes(32), // b[1][0]
      ethers.randomBytes(32), // b[1][1]
      ethers.randomBytes(32), // c[0]
      ethers.randomBytes(32), // c[1]
    ]);

    return {
      proof: ethers.hexlify(proofData),
      publicInputs: [merkleRoot],
      merkleRoot,
    };
  }

  /**
   * Submit a vote commitment to the blockchain
   */
  async submit(
    sessionId: string,
    commitment: string,
    eligibilityProof: string
  ): Promise<VoteReceipt> {
    const tx = await this.votingRegistry.commitVote(
      sessionId,
      commitment,
      eligibilityProof
    );
    const receipt = await tx.wait();

    return {
      sessionId,
      commitment,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: Date.now(),
    };
  }

  /**
   * Prepare and submit a vote in one call
   */
  async prepareAndSubmit(
    sessionId: string,
    choice: VoteChoice,
    citizenId: string,
    merkleProof: string[] = []
  ): Promise<{
    receipt: VoteReceipt;
    salt: string;
    nullifier: string;
  }> {
    // Prepare the vote
    const { commitment, salt, nullifier } = await this.prepare(
      sessionId,
      choice,
      citizenId
    );

    // Generate eligibility proof
    const eligibilityProof = await this.generateEligibilityProof(
      citizenId,
      merkleProof
    );

    // Submit to blockchain
    const receipt = await this.submit(
      sessionId,
      commitment,
      eligibilityProof.proof
    );

    return {
      receipt,
      salt,
      nullifier,
    };
  }

  /**
   * Verify a commitment matches the expected format
   */
  verifyCommitmentFormat(commitment: string): boolean {
    try {
      if (!commitment.startsWith("0x")) return false;
      if (commitment.length !== 66) return false;
      ethers.getBytes(commitment);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compute a commitment from components
   */
  computeCommitment(
    choice: VoteChoice,
    salt: string,
    nullifier: string
  ): string {
    return computeCommitment(choice, salt, nullifier);
  }
}
