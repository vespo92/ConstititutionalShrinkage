// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVoteVerifier
 * @notice Interface for ZK proof verification
 * @dev Handles eligibility and vote validity proofs
 */
interface IVoteVerifier {
    /// @notice Represents an eligibility proof
    struct EligibilityProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[] publicInputs;
    }

    /// @notice Represents a vote validity proof
    struct VoteValidityProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        bytes32 commitment;
    }

    /// @notice Emitted when eligibility root is updated
    event EligibilityRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);

    /// @notice Emitted when a proof is verified
    event ProofVerified(bytes32 indexed proofHash, bool valid);

    /// @notice Verifies an eligibility proof
    function verifyEligibility(
        bytes calldata proof,
        bytes32 merkleRoot
    ) external view returns (bool);

    /// @notice Verifies a vote validity proof
    function verifyVoteValidity(
        bytes calldata proof,
        bytes32 commitment
    ) external view returns (bool);

    /// @notice Verifies a delegation chain proof
    function verifyDelegationChain(
        bytes calldata proof,
        address finalDelegate,
        uint256 maxDepth
    ) external view returns (bool);

    /// @notice Sets the eligible citizens merkle root
    function setEligibilityRoot(bytes32 newRoot) external;

    /// @notice Gets the current eligibility root
    function getEligibilityRoot() external view returns (bytes32);

    /// @notice Batch verifies multiple proofs
    function batchVerify(
        bytes[] calldata proofs,
        bytes32[] calldata commitments
    ) external view returns (bool[] memory);
}
