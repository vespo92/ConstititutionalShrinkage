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
  eventType: AuditEventType;
  primaryKey: string;
  secondaryKey: string;
  actor: string;
  dataHash: string;
  blockNumber: number;
}

export enum AuditEventType {
  SESSION_CREATED = 0,
  VOTE_COMMITTED = 1,
  VOTE_REVEALED = 2,
  SESSION_FINALIZED = 3,
  DELEGATION_CREATED = 4,
  DELEGATION_REVOKED = 5,
  BILL_REGISTERED = 6,
  BILL_STATUS_CHANGED = 7,
  ELIGIBILITY_ROOT_UPDATED = 8,
  SYSTEM_PAUSED = 9,
  SYSTEM_UNPAUSED = 10,
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

export interface CommitVoteRequest {
  sessionId: string;
  commitment: string;
  eligibilityProof: string;
}

export interface RevealVoteRequest {
  sessionId: string;
  choice: VoteChoice;
  salt: string;
  nullifier: string;
}

export interface CreateSessionRequest {
  sessionId: string;
  billHash: string;
  startTime: number;
  endTime: number;
}

export interface ContractAddresses {
  votingRegistry: string;
  voteVerifier: string;
  delegationRegistry: string;
  billRegistry: string;
  auditTrail: string;
}
