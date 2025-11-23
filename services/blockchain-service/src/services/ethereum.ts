import { ethers, Contract } from "ethers";
import {
  VOTING_REGISTRY_ABI,
  VOTE_VERIFIER_ABI,
  DELEGATION_REGISTRY_ABI,
  BILL_REGISTRY_ABI,
  AUDIT_TRAIL_ABI,
  getContractAddresses,
} from "../lib/contracts";
import { getServerWallet } from "../lib/wallet";
import { VotingSession, VoteCommitment, AuditEntry } from "../types";

class EthereumService {
  private provider: ethers.JsonRpcProvider | null = null;
  private votingRegistry: Contract | null = null;
  private voteVerifier: Contract | null = null;
  private delegationRegistry: Contract | null = null;
  private billRegistry: Contract | null = null;
  private auditTrail: Contract | null = null;

  private getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      const rpcUrl = process.env.ETHEREUM_RPC_URL || "http://localhost:8545";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this.provider;
  }

  private getVotingRegistry(): Contract {
    if (!this.votingRegistry) {
      const addresses = getContractAddresses();
      const wallet = getServerWallet(this.getProvider());
      this.votingRegistry = new ethers.Contract(
        addresses.votingRegistry,
        VOTING_REGISTRY_ABI,
        wallet
      );
    }
    return this.votingRegistry;
  }

  private getVoteVerifier(): Contract {
    if (!this.voteVerifier) {
      const addresses = getContractAddresses();
      this.voteVerifier = new ethers.Contract(
        addresses.voteVerifier,
        VOTE_VERIFIER_ABI,
        this.getProvider()
      );
    }
    return this.voteVerifier;
  }

  private getAuditTrail(): Contract {
    if (!this.auditTrail) {
      const addresses = getContractAddresses();
      this.auditTrail = new ethers.Contract(
        addresses.auditTrail,
        AUDIT_TRAIL_ABI,
        this.getProvider()
      );
    }
    return this.auditTrail;
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.getProvider().getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  async getSession(sessionId: string): Promise<VotingSession | null> {
    try {
      const contract = this.getVotingRegistry();
      const session = await contract.getSession(sessionId);

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
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  async createSession(
    sessionId: string,
    billHash: string,
    startTime: number,
    endTime: number
  ): Promise<string> {
    const contract = this.getVotingRegistry();
    const tx = await contract.createSession(sessionId, billHash, startTime, endTime);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async commitVote(
    sessionId: string,
    commitment: string,
    eligibilityProof: string
  ): Promise<string> {
    const contract = this.getVotingRegistry();
    const tx = await contract.commitVote(sessionId, commitment, eligibilityProof);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async revealVote(
    sessionId: string,
    choice: number,
    salt: string,
    nullifier: string
  ): Promise<string> {
    const contract = this.getVotingRegistry();
    const tx = await contract.revealVote(sessionId, choice, salt, nullifier);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async finalizeSession(sessionId: string, merkleRoot: string): Promise<string> {
    const contract = this.getVotingRegistry();
    const tx = await contract.finalizeSession(sessionId, merkleRoot);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getCommitment(sessionId: string, voter: string): Promise<VoteCommitment | null> {
    try {
      const contract = this.getVotingRegistry();
      const commitment = await contract.getCommitment(sessionId, voter);

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

  async isNullifierUsed(nullifier: string): Promise<boolean> {
    const contract = this.getVotingRegistry();
    return contract.isNullifierUsed(nullifier);
  }

  async getEligibilityRoot(): Promise<string> {
    const contract = this.getVoteVerifier();
    return contract.getEligibilityRoot();
  }

  async verifyEligibility(proof: string, merkleRoot: string): Promise<boolean> {
    const contract = this.getVoteVerifier();
    return contract.verifyEligibility(proof, merkleRoot);
  }

  async getAuditEntriesBySession(sessionId: string): Promise<AuditEntry[]> {
    try {
      const contract = this.getAuditTrail();
      const entries = await contract.getEntriesByKey(sessionId);

      return entries.map((entry: {
        timestamp: bigint;
        eventType: number;
        primaryKey: string;
        secondaryKey: string;
        actor: string;
        dataHash: string;
        blockNumber: bigint;
      }) => ({
        timestamp: Number(entry.timestamp),
        eventType: entry.eventType,
        primaryKey: entry.primaryKey,
        secondaryKey: entry.secondaryKey,
        actor: entry.actor,
        dataHash: entry.dataHash,
        blockNumber: Number(entry.blockNumber),
      }));
    } catch {
      return [];
    }
  }

  async getAuditEntryCount(): Promise<number> {
    const contract = this.getAuditTrail();
    return Number(await contract.getEntryCount());
  }

  async getBlockNumber(): Promise<number> {
    return this.getProvider().getBlockNumber();
  }

  async getTransaction(hash: string) {
    return this.getProvider().getTransaction(hash);
  }

  async getTransactionReceipt(hash: string) {
    return this.getProvider().getTransactionReceipt(hash);
  }
}

export const ethereumService = new EthereumService();
