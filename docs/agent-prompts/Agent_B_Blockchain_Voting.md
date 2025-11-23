# Agent_B: Blockchain Voting Verification Layer

## Mission
Implement a blockchain-based vote verification system using Ethereum L2 (Optimism/Arbitrum) to provide cryptographic proof of vote integrity, ensuring votes cannot be tampered with while maintaining voter privacy.

## Branch
```
claude/agent-B-blockchain-voting-{session-id}
```

## Priority: CRITICAL

## Context
The voting system must be:
- **Verifiable**: Anyone can verify vote counts are accurate
- **Tamper-proof**: Votes cannot be modified after casting
- **Private**: Individual votes remain secret
- **Auditable**: Complete audit trail without revealing identity
- **Efficient**: Low gas costs via L2 scaling

## Target Directories
```
packages/blockchain/
services/blockchain-service/
contracts/
```

## Your Deliverables

### 1. Smart Contracts (Solidity)

```
contracts/
├── src/
│   ├── VotingRegistry.sol          # Main voting contract
│   ├── VoteVerifier.sol            # ZK proof verification
│   ├── DelegationRegistry.sol      # On-chain delegation tracking
│   ├── BillRegistry.sol            # Bill hash anchoring
│   ├── AuditTrail.sol              # Immutable audit log
│   └── interfaces/
│       ├── IVotingRegistry.sol
│       └── IVoteVerifier.sol
├── test/
│   ├── VotingRegistry.test.ts
│   ├── VoteVerifier.test.ts
│   └── Integration.test.ts
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
├── hardhat.config.ts
└── package.json
```

#### VotingRegistry Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract VotingRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct VotingSession {
        bytes32 billHash;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool finalized;
        bytes32 merkleRoot;  // Root of all vote commitments
    }

    struct VoteCommitment {
        bytes32 commitment;  // hash(vote + salt + nullifier)
        uint256 timestamp;
        bool revealed;
    }

    mapping(bytes32 => VotingSession) public sessions;
    mapping(bytes32 => mapping(address => VoteCommitment)) public commitments;
    mapping(bytes32 => bool) public nullifierUsed;

    event SessionCreated(bytes32 indexed sessionId, bytes32 billHash);
    event VoteCommitted(bytes32 indexed sessionId, bytes32 commitment);
    event VoteRevealed(bytes32 indexed sessionId, uint8 choice);
    event SessionFinalized(bytes32 indexed sessionId, bytes32 merkleRoot);

    // Commit-reveal voting scheme for privacy
    function commitVote(
        bytes32 sessionId,
        bytes32 commitment,
        bytes calldata zkProof
    ) external nonReentrant {
        // Verify ZK proof that voter is eligible
        require(verifyEligibility(zkProof), "Invalid eligibility proof");

        VotingSession storage session = sessions[sessionId];
        require(block.timestamp >= session.startTime, "Voting not started");
        require(block.timestamp <= session.endTime, "Voting ended");

        commitments[sessionId][msg.sender] = VoteCommitment({
            commitment: commitment,
            timestamp: block.timestamp,
            revealed: false
        });

        emit VoteCommitted(sessionId, commitment);
    }

    function revealVote(
        bytes32 sessionId,
        uint8 choice,
        bytes32 salt,
        bytes32 nullifier
    ) external nonReentrant {
        require(!nullifierUsed[nullifier], "Vote already counted");

        VoteCommitment storage vc = commitments[sessionId][msg.sender];
        bytes32 expectedCommitment = keccak256(abi.encodePacked(choice, salt, nullifier));
        require(vc.commitment == expectedCommitment, "Invalid reveal");

        nullifierUsed[nullifier] = true;
        vc.revealed = true;

        VotingSession storage session = sessions[sessionId];
        if (choice == 1) session.yesVotes++;
        else if (choice == 2) session.noVotes++;
        else session.abstainVotes++;

        emit VoteRevealed(sessionId, choice);
    }

    // ... more functions
}
```

### 2. Blockchain Service

```
services/blockchain-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── sessions.ts             # Voting session management
│   │   ├── votes.ts                # Vote submission
│   │   ├── verify.ts               # Verification endpoints
│   │   └── audit.ts                # Audit trail queries
│   ├── services/
│   │   ├── ethereum.ts             # Ethereum client
│   │   ├── zk-proofs.ts            # ZK proof generation
│   │   ├── merkle.ts               # Merkle tree operations
│   │   └── commitment.ts           # Vote commitment handling
│   ├── lib/
│   │   ├── contracts.ts            # Contract ABIs & addresses
│   │   └── wallet.ts               # Server wallet management
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 3. TypeScript SDK (packages/blockchain)

```
packages/blockchain/
├── src/
│   ├── client.ts                   # Main blockchain client
│   ├── voting/
│   │   ├── commit.ts               # Vote commitment
│   │   ├── reveal.ts               # Vote reveal
│   │   └── verify.ts               # Vote verification
│   ├── proofs/
│   │   ├── eligibility.ts          # Eligibility proofs
│   │   └── membership.ts           # Set membership proofs
│   ├── utils/
│   │   ├── hash.ts
│   │   ├── merkle.ts
│   │   └── nullifier.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Zero-Knowledge Proofs

```typescript
// Implement ZK circuits for:

// 1. Eligibility Proof
// Proves voter is registered citizen without revealing identity
circuit EligibilityProof {
  signal input citizenId;           // Private
  signal input merkleRoot;          // Public (registered citizens)
  signal input merkleProof[];       // Private
  signal output isEligible;
}

// 2. Vote Validity Proof
// Proves vote is valid (0, 1, or 2) without revealing choice
circuit VoteValidityProof {
  signal input vote;                // Private
  signal input salt;                // Private
  signal output commitment;         // Public
}

// 3. Delegation Proof
// Proves delegation chain without revealing intermediates
circuit DelegationProof {
  signal input delegator;           // Private
  signal input finalDelegate;       // Private
  signal input chainLength;         // Public (max depth)
  signal output validChain;
}
```

### 5. Verification API

```typescript
// Public verification endpoints
interface VerificationAPI {
  // Verify a single vote was recorded
  verifyVote(receipt: VoteReceipt): Promise<VerificationResult>;

  // Verify session totals match blockchain
  verifySessionTotals(sessionId: string): Promise<TallyVerification>;

  // Get merkle proof for vote inclusion
  getInclusionProof(sessionId: string, commitment: string): Promise<MerkleProof>;

  // Audit complete voting session
  auditSession(sessionId: string): Promise<AuditReport>;
}
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Smart Contracts | 5-6 |
| Service Endpoints | 15-20 |
| SDK Functions | 25-30 |
| Lines of Code | 5,000-6,000 |
| Test Coverage | 95%+ |

## Success Criteria

1. [ ] Smart contracts deployed to testnet (Sepolia/Goerli)
2. [ ] Commit-reveal voting scheme working
3. [ ] ZK eligibility proofs implemented
4. [ ] Vote verification API functional
5. [ ] Merkle tree proof generation working
6. [ ] Audit trail immutably recorded
7. [ ] Gas costs optimized (<$0.10 per vote on L2)
8. [ ] Full test coverage on contracts
9. [ ] Security audit checklist passed

---

*Agent_B Assignment - Blockchain Voting Verification*
