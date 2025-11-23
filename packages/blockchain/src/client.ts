import { ethers, Contract, Wallet, Provider } from "ethers";
import {
  BlockchainClientConfig,
  VotingSession,
  VoteCommitment,
  VoteReceipt,
  VoteChoice,
  TransactionResult,
} from "./types";
import { VoteCommitter } from "./voting/commit";
import { VoteRevealer } from "./voting/reveal";
import { VoteVerifier } from "./voting/verify";
import { VOTING_REGISTRY_ABI, VOTE_VERIFIER_ABI } from "./abis";

export class BlockchainClient {
  private provider: Provider;
  private wallet: Wallet | null = null;
  private votingRegistry: Contract;
  private voteVerifier: Contract;

  public readonly commit: VoteCommitter;
  public readonly reveal: VoteRevealer;
  public readonly verify: VoteVerifier;

  constructor(config: BlockchainClientConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);

    if (config.privateKey) {
      this.wallet = new Wallet(config.privateKey, this.provider);
    }

    const signer = this.wallet || this.provider;

    this.votingRegistry = new Contract(
      config.contracts.votingRegistry,
      VOTING_REGISTRY_ABI,
      signer
    );

    this.voteVerifier = new Contract(
      config.contracts.voteVerifier,
      VOTE_VERIFIER_ABI,
      this.provider
    );

    // Initialize sub-modules
    this.commit = new VoteCommitter(this.votingRegistry, this.voteVerifier);
    this.reveal = new VoteRevealer(this.votingRegistry);
    this.verify = new VoteVerifier(
      this.votingRegistry,
      this.voteVerifier,
      this.provider
    );
  }

  /**
   * Check if connected to the network
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Get a voting session by ID
   */
  async getSession(sessionId: string): Promise<VotingSession | null> {
    try {
      const session = await this.votingRegistry.getSession(sessionId);

      if (session.billHash === ethers.ZeroHash) {
        return null;
      }

      return {
        sessionId,
        billHash: session.billHash,
        startTime: Number(session.startTime),
        endTime: Number(session.endTime),
        yesVotes: Number(session.yesVotes),
        noVotes: Number(session.noVotes),
        abstainVotes: Number(session.abstainVotes),
        finalized: session.finalized,
        merkleRoot: session.merkleRoot,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get a vote commitment
   */
  async getCommitment(
    sessionId: string,
    voter: string
  ): Promise<VoteCommitment | null> {
    try {
      const commitment = await this.votingRegistry.getCommitment(sessionId, voter);

      if (commitment.commitment === ethers.ZeroHash) {
        return null;
      }

      return {
        commitment: commitment.commitment,
        timestamp: Number(commitment.timestamp),
        revealed: commitment.revealed,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if a nullifier has been used
   */
  async isNullifierUsed(nullifier: string): Promise<boolean> {
    return this.votingRegistry.isNullifierUsed(nullifier);
  }

  /**
   * Get the current eligibility merkle root
   */
  async getEligibilityRoot(): Promise<string> {
    return this.voteVerifier.getEligibilityRoot();
  }

  /**
   * Create a new voting session
   */
  async createSession(
    sessionId: string,
    billHash: string,
    startTime: number,
    endTime: number
  ): Promise<TransactionResult> {
    if (!this.wallet) {
      throw new Error("Wallet not configured");
    }

    const tx = await this.votingRegistry.createSession(
      sessionId,
      billHash,
      startTime,
      endTime
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
   * Finalize a voting session
   */
  async finalizeSession(
    sessionId: string,
    merkleRoot: string
  ): Promise<TransactionResult> {
    if (!this.wallet) {
      throw new Error("Wallet not configured");
    }

    const tx = await this.votingRegistry.finalizeSession(sessionId, merkleRoot);
    const receipt = await tx.wait();

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmations: await receipt.confirmations(),
      gasUsed: receipt.gasUsed,
    };
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string) {
    return this.provider.getTransaction(hash);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string) {
    return this.provider.getTransactionReceipt(hash);
  }

  /**
   * Get the wallet address
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }
}

/**
 * Create a new blockchain client instance
 */
export function createBlockchainClient(
  config: BlockchainClientConfig
): BlockchainClient {
  return new BlockchainClient(config);
}
