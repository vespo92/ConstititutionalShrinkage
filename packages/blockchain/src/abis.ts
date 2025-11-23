export const VOTING_REGISTRY_ABI = [
  "function createSession(bytes32 sessionId, bytes32 billHash, uint256 startTime, uint256 endTime) external",
  "function commitVote(bytes32 sessionId, bytes32 commitment, bytes calldata eligibilityProof) external",
  "function revealVote(bytes32 sessionId, uint8 choice, bytes32 salt, bytes32 nullifier) external",
  "function finalizeSession(bytes32 sessionId, bytes32 merkleRoot) external",
  "function getSession(bytes32 sessionId) external view returns (tuple(bytes32 billHash, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, uint256 abstainVotes, bool finalized, bytes32 merkleRoot))",
  "function getCommitment(bytes32 sessionId, address voter) external view returns (tuple(bytes32 commitment, uint256 timestamp, bool revealed))",
  "function isNullifierUsed(bytes32 nullifier) external view returns (bool)",
  "function pause() external",
  "function unpause() external",
  "function paused() external view returns (bool)",
  "event SessionCreated(bytes32 indexed sessionId, bytes32 indexed billHash, uint256 startTime, uint256 endTime)",
  "event VoteCommitted(bytes32 indexed sessionId, address indexed voter, bytes32 commitment)",
  "event VoteRevealed(bytes32 indexed sessionId, address indexed voter, uint8 choice)",
  "event SessionFinalized(bytes32 indexed sessionId, bytes32 merkleRoot, uint256 yesVotes, uint256 noVotes, uint256 abstainVotes)",
];

export const VOTE_VERIFIER_ABI = [
  "function verifyEligibility(bytes calldata proof, bytes32 merkleRoot) external view returns (bool)",
  "function verifyVoteValidity(bytes calldata proof, bytes32 commitment) external view returns (bool)",
  "function verifyDelegationChain(bytes calldata proof, address finalDelegate, uint256 maxDepth) external view returns (bool)",
  "function setEligibilityRoot(bytes32 newRoot) external",
  "function getEligibilityRoot() external view returns (bytes32)",
  "function batchVerify(bytes[] calldata proofs, bytes32[] calldata commitments) external view returns (bool[])",
  "event EligibilityRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot)",
  "event ProofVerified(bytes32 indexed proofHash, bool valid)",
];

export const DELEGATION_REGISTRY_ABI = [
  "function delegate(address delegate) external",
  "function delegateByCategory(address delegate, bytes32 category) external",
  "function revokeDelegation() external",
  "function revokeCategoryDelegation(bytes32 category) external",
  "function getFinalDelegate(address delegator) external view returns (address)",
  "function getFinalDelegateByCategory(address delegator, bytes32 category) external view returns (address)",
  "function getDelegationChain(address delegator) external view returns (address[])",
  "function delegationCount(address delegate) external view returns (uint256)",
  "event DelegationCreated(address indexed delegator, address indexed delegate, bytes32 category, uint256 timestamp)",
  "event DelegationRevoked(address indexed delegator, address indexed previousDelegate, bytes32 category)",
  "event DelegationTransferred(address indexed delegator, address indexed oldDelegate, address indexed newDelegate)",
];

export const BILL_REGISTRY_ABI = [
  "function registerBill(bytes32 billId, bytes32 contentHash, bytes32 titleHash, string calldata externalId) external",
  "function updateStatus(bytes32 billId, uint8 newStatus) external",
  "function addAmendment(bytes32 billId, bytes32 amendmentHash) external",
  "function getBill(bytes32 billId) external view returns (tuple(bytes32 contentHash, bytes32 titleHash, uint256 registeredAt, uint256 lastUpdated, uint8 status, string externalId, address registrar, bytes32[] amendments))",
  "function getBillByExternalId(string calldata externalId) external view returns (tuple(bytes32 contentHash, bytes32 titleHash, uint256 registeredAt, uint256 lastUpdated, uint8 status, string externalId, address registrar, bytes32[] amendments))",
  "function verifyBillHash(bytes32 billId, bytes32 contentHash) external view returns (bool)",
  "function getAmendments(bytes32 billId) external view returns (bytes32[])",
  "function getBillCount() external view returns (uint256)",
  "event BillRegistered(bytes32 indexed billId, bytes32 contentHash, string externalId, address registrar)",
  "event BillStatusUpdated(bytes32 indexed billId, uint8 oldStatus, uint8 newStatus)",
  "event AmendmentAdded(bytes32 indexed billId, bytes32 amendmentHash, uint256 amendmentIndex)",
];

export const AUDIT_TRAIL_ABI = [
  "function recordEntry(uint8 eventType, bytes32 primaryKey, bytes32 secondaryKey, address actor, bytes32 dataHash) external",
  "function recordSessionCreated(bytes32 sessionId, bytes32 billHash, address actor) external",
  "function recordVoteCommitted(bytes32 sessionId, bytes32 commitment, address actor) external",
  "function recordVoteRevealed(bytes32 sessionId, address actor, bytes32 choiceHash) external",
  "function recordSessionFinalized(bytes32 sessionId, bytes32 merkleRoot, bytes32 resultsHash) external",
  "function getEntry(uint256 index) external view returns (tuple(uint256 timestamp, uint8 eventType, bytes32 primaryKey, bytes32 secondaryKey, address actor, bytes32 dataHash, uint256 blockNumber))",
  "function getEntriesByKey(bytes32 primaryKey) external view returns (tuple(uint256 timestamp, uint8 eventType, bytes32 primaryKey, bytes32 secondaryKey, address actor, bytes32 dataHash, uint256 blockNumber)[])",
  "function getEntriesByActor(address actor) external view returns (tuple(uint256 timestamp, uint8 eventType, bytes32 primaryKey, bytes32 secondaryKey, address actor, bytes32 dataHash, uint256 blockNumber)[])",
  "function getEntryCount() external view returns (uint256)",
  "function getEntryHash(uint256 index) external view returns (bytes32)",
  "event AuditEntryRecorded(uint256 indexed entryIndex, uint8 indexed eventType, bytes32 indexed primaryKey, address actor, uint256 timestamp)",
];
