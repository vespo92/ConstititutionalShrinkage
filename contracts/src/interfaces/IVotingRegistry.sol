// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVotingRegistry
 * @notice Interface for the main voting registry contract
 * @dev Defines the core voting functionality for the Constitutional Shrinkage platform
 */
interface IVotingRegistry {
    /// @notice Vote choices
    enum VoteChoice {
        ABSTAIN,
        YES,
        NO
    }

    /// @notice Represents a voting session for a bill
    struct VotingSession {
        bytes32 billHash;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
        bool finalized;
        bytes32 merkleRoot;
    }

    /// @notice Represents a vote commitment
    struct VoteCommitment {
        bytes32 commitment;
        uint256 timestamp;
        bool revealed;
    }

    /// @notice Emitted when a new voting session is created
    event SessionCreated(
        bytes32 indexed sessionId,
        bytes32 indexed billHash,
        uint256 startTime,
        uint256 endTime
    );

    /// @notice Emitted when a vote is committed
    event VoteCommitted(
        bytes32 indexed sessionId,
        address indexed voter,
        bytes32 commitment
    );

    /// @notice Emitted when a vote is revealed
    event VoteRevealed(
        bytes32 indexed sessionId,
        address indexed voter,
        VoteChoice choice
    );

    /// @notice Emitted when a session is finalized
    event SessionFinalized(
        bytes32 indexed sessionId,
        bytes32 merkleRoot,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes
    );

    /// @notice Creates a new voting session
    function createSession(
        bytes32 sessionId,
        bytes32 billHash,
        uint256 startTime,
        uint256 endTime
    ) external;

    /// @notice Commits a vote using commit-reveal scheme
    function commitVote(
        bytes32 sessionId,
        bytes32 commitment,
        bytes calldata eligibilityProof
    ) external;

    /// @notice Reveals a previously committed vote
    function revealVote(
        bytes32 sessionId,
        VoteChoice choice,
        bytes32 salt,
        bytes32 nullifier
    ) external;

    /// @notice Finalizes a voting session
    function finalizeSession(bytes32 sessionId, bytes32 merkleRoot) external;

    /// @notice Gets session details
    function getSession(bytes32 sessionId) external view returns (VotingSession memory);

    /// @notice Gets vote commitment for a voter
    function getCommitment(bytes32 sessionId, address voter) external view returns (VoteCommitment memory);

    /// @notice Checks if a nullifier has been used
    function isNullifierUsed(bytes32 nullifier) external view returns (bool);
}
