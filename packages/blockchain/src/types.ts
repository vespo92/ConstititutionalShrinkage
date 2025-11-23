export interface BlockchainClientConfig {
  rpcUrl: string;
  chainId: number;
  contracts: ContractAddresses;
  privateKey?: string;
}

export interface ContractAddresses {
  votingRegistry: string;
  voteVerifier: string;
  delegationRegistry: string;
  billRegistry: string;
  auditTrail: string;
}

export interface VotingSession {
  sessionId: string;
  billHash: string;
  startTime: number;
  endTime: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  finalized: boolean;
  merkleRoot: string;
}

export interface VoteCommitment {
  commitment: string;
  timestamp: number;
  revealed: boolean;
}

export interface VoteReceipt {
  sessionId: string;
  commitment: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  sessionId: string;
  commitment?: string;
  blockNumber?: number;
  transactionHash?: string;
  error?: string;
}

export interface TallyVerification {
  sessionId: string;
  onChainTally: {
    yes: number;
    no: number;
    abstain: number;
  };
  verified: boolean;
  merkleRoot: string;
}

export interface MerkleProof {
  sessionId: string;
  commitment: string;
  proof: string[];
  root: string;
  index: number;
  valid: boolean;
}

export interface AuditEntry {
  timestamp: number;
  eventType: number;
  primaryKey: string;
  secondaryKey: string;
  actor: string;
  dataHash: string;
  blockNumber: number;
}

export interface AuditReport {
  sessionId: string;
  totalCommitments: number;
  totalReveals: number;
  finalTally: {
    yes: number;
    no: number;
    abstain: number;
  };
  merkleRoot: string;
  entries: AuditEntry[];
  generatedAt: number;
}

export enum VoteChoice {
  ABSTAIN = 0,
  YES = 1,
  NO = 2,
}

export interface EligibilityProof {
  proof: string;
  publicInputs: string[];
  merkleRoot: string;
}

export interface DelegationInfo {
  delegator: string;
  delegate: string;
  category?: string;
  timestamp: number;
  active: boolean;
}

export interface BillInfo {
  billId: string;
  contentHash: string;
  titleHash: string;
  externalId: string;
  status: BillStatus;
  registeredAt: number;
  lastUpdated: number;
  amendments: string[];
}

export enum BillStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  VOTING = 2,
  PASSED = 3,
  REJECTED = 4,
  ENACTED = 5,
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  confirmations: number;
  gasUsed: bigint;
}
