// Main exports
export { BlockchainClient, createBlockchainClient } from "./client";

// Voting exports
export { VoteCommitter } from "./voting/commit";
export { VoteRevealer } from "./voting/reveal";
export { VoteVerifier } from "./voting/verify";

// Proof exports
export { EligibilityProver } from "./proofs/eligibility";
export { MembershipProver } from "./proofs/membership";

// Utility exports
export { hashData, hashBytes, computeCommitment } from "./utils/hash";
export { MerkleTreeBuilder, verifyMerkleProof } from "./utils/merkle";
export { generateNullifier, computeNullifierFromSecret } from "./utils/nullifier";

// Type exports
export type {
  VotingSession,
  VoteCommitment,
  VoteReceipt,
  VerificationResult,
  TallyVerification,
  MerkleProof,
  AuditEntry,
  AuditReport,
  VoteChoice,
  BlockchainClientConfig,
  ContractAddresses,
} from "./types";
