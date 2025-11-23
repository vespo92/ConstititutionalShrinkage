// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IVotingRegistry.sol";
import "./interfaces/IVoteVerifier.sol";

/**
 * @title VotingRegistry
 * @notice Main voting contract for Constitutional Shrinkage platform
 * @dev Implements commit-reveal voting scheme with ZK proof eligibility verification
 */
contract VotingRegistry is IVotingRegistry, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant FINALIZER_ROLE = keccak256("FINALIZER_ROLE");

    /// @notice The vote verifier contract
    IVoteVerifier public immutable verifier;

    /// @notice Mapping of session ID to voting session
    mapping(bytes32 => VotingSession) public sessions;

    /// @notice Mapping of session ID to voter address to vote commitment
    mapping(bytes32 => mapping(address => VoteCommitment)) public commitments;

    /// @notice Mapping of nullifiers to prevent double voting
    mapping(bytes32 => bool) public nullifierUsed;

    /// @notice Minimum voting duration in seconds
    uint256 public constant MIN_VOTING_DURATION = 1 hours;

    /// @notice Maximum voting duration in seconds
    uint256 public constant MAX_VOTING_DURATION = 30 days;

    /// @notice Reveal period after voting ends
    uint256 public constant REVEAL_PERIOD = 24 hours;

    /// @notice Custom errors
    error InvalidSession();
    error VotingNotStarted();
    error VotingEnded();
    error VotingNotEnded();
    error RevealPeriodEnded();
    error InvalidDuration();
    error SessionAlreadyExists();
    error SessionAlreadyFinalized();
    error InvalidEligibilityProof();
    error AlreadyCommitted();
    error NotCommitted();
    error AlreadyRevealed();
    error InvalidReveal();
    error NullifierAlreadyUsed();

    constructor(address _verifier) {
        verifier = IVoteVerifier(_verifier);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
        _grantRole(FINALIZER_ROLE, msg.sender);
    }

    /**
     * @notice Creates a new voting session
     * @param sessionId Unique identifier for the session
     * @param billHash Hash of the bill being voted on
     * @param startTime Unix timestamp when voting starts
     * @param endTime Unix timestamp when voting ends
     */
    function createSession(
        bytes32 sessionId,
        bytes32 billHash,
        uint256 startTime,
        uint256 endTime
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused {
        if (sessions[sessionId].billHash != bytes32(0)) revert SessionAlreadyExists();
        if (endTime <= startTime) revert InvalidDuration();
        if (endTime - startTime < MIN_VOTING_DURATION) revert InvalidDuration();
        if (endTime - startTime > MAX_VOTING_DURATION) revert InvalidDuration();

        sessions[sessionId] = VotingSession({
            billHash: billHash,
            startTime: startTime,
            endTime: endTime,
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0,
            finalized: false,
            merkleRoot: bytes32(0)
        });

        emit SessionCreated(sessionId, billHash, startTime, endTime);
    }

    /**
     * @notice Commits a vote using commit-reveal scheme
     * @param sessionId The voting session ID
     * @param commitment Hash of (choice, salt, nullifier)
     * @param eligibilityProof ZK proof of voter eligibility
     */
    function commitVote(
        bytes32 sessionId,
        bytes32 commitment,
        bytes calldata eligibilityProof
    ) external nonReentrant whenNotPaused {
        VotingSession storage session = sessions[sessionId];

        if (session.billHash == bytes32(0)) revert InvalidSession();
        if (block.timestamp < session.startTime) revert VotingNotStarted();
        if (block.timestamp > session.endTime) revert VotingEnded();

        // Verify eligibility using ZK proof
        if (!verifier.verifyEligibility(eligibilityProof, verifier.getEligibilityRoot())) {
            revert InvalidEligibilityProof();
        }

        VoteCommitment storage vc = commitments[sessionId][msg.sender];
        if (vc.commitment != bytes32(0)) revert AlreadyCommitted();

        vc.commitment = commitment;
        vc.timestamp = block.timestamp;
        vc.revealed = false;

        emit VoteCommitted(sessionId, msg.sender, commitment);
    }

    /**
     * @notice Reveals a previously committed vote
     * @param sessionId The voting session ID
     * @param choice The vote choice (ABSTAIN, YES, NO)
     * @param salt Random value used in commitment
     * @param nullifier Unique value to prevent double voting
     */
    function revealVote(
        bytes32 sessionId,
        VoteChoice choice,
        bytes32 salt,
        bytes32 nullifier
    ) external nonReentrant whenNotPaused {
        VotingSession storage session = sessions[sessionId];

        if (session.billHash == bytes32(0)) revert InvalidSession();
        if (block.timestamp <= session.endTime) revert VotingNotEnded();
        if (block.timestamp > session.endTime + REVEAL_PERIOD) revert RevealPeriodEnded();
        if (session.finalized) revert SessionAlreadyFinalized();

        if (nullifierUsed[nullifier]) revert NullifierAlreadyUsed();

        VoteCommitment storage vc = commitments[sessionId][msg.sender];
        if (vc.commitment == bytes32(0)) revert NotCommitted();
        if (vc.revealed) revert AlreadyRevealed();

        // Verify the reveal matches the commitment
        bytes32 expectedCommitment = keccak256(abi.encodePacked(uint8(choice), salt, nullifier));
        if (vc.commitment != expectedCommitment) revert InvalidReveal();

        nullifierUsed[nullifier] = true;
        vc.revealed = true;

        // Tally the vote
        if (choice == VoteChoice.YES) {
            session.yesVotes++;
        } else if (choice == VoteChoice.NO) {
            session.noVotes++;
        } else {
            session.abstainVotes++;
        }

        emit VoteRevealed(sessionId, msg.sender, choice);
    }

    /**
     * @notice Finalizes a voting session
     * @param sessionId The voting session ID
     * @param merkleRoot Root of the merkle tree containing all vote commitments
     */
    function finalizeSession(
        bytes32 sessionId,
        bytes32 merkleRoot
    ) external onlyRole(FINALIZER_ROLE) {
        VotingSession storage session = sessions[sessionId];

        if (session.billHash == bytes32(0)) revert InvalidSession();
        if (block.timestamp <= session.endTime + REVEAL_PERIOD) revert VotingNotEnded();
        if (session.finalized) revert SessionAlreadyFinalized();

        session.finalized = true;
        session.merkleRoot = merkleRoot;

        emit SessionFinalized(
            sessionId,
            merkleRoot,
            session.yesVotes,
            session.noVotes,
            session.abstainVotes
        );
    }

    /**
     * @notice Gets session details
     * @param sessionId The voting session ID
     * @return The voting session struct
     */
    function getSession(bytes32 sessionId) external view returns (VotingSession memory) {
        return sessions[sessionId];
    }

    /**
     * @notice Gets vote commitment for a voter
     * @param sessionId The voting session ID
     * @param voter The voter address
     * @return The vote commitment struct
     */
    function getCommitment(
        bytes32 sessionId,
        address voter
    ) external view returns (VoteCommitment memory) {
        return commitments[sessionId][voter];
    }

    /**
     * @notice Checks if a nullifier has been used
     * @param nullifier The nullifier to check
     * @return True if the nullifier has been used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifierUsed[nullifier];
    }

    /**
     * @notice Pauses the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
