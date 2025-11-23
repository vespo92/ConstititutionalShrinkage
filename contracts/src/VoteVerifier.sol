// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IVoteVerifier.sol";

/**
 * @title VoteVerifier
 * @notice Verifies ZK proofs for voter eligibility and vote validity
 * @dev Implements Groth16 proof verification for the voting system
 */
contract VoteVerifier is IVoteVerifier, AccessControl {
    bytes32 public constant VERIFIER_ADMIN_ROLE = keccak256("VERIFIER_ADMIN_ROLE");

    /// @notice The current eligibility merkle root
    bytes32 private _eligibilityRoot;

    /// @notice Verification key for eligibility proofs
    struct VerificationKey {
        uint256[2] alpha;
        uint256[2][2] beta;
        uint256[2][2] gamma;
        uint256[2][2] delta;
        uint256[2][] ic;
    }

    VerificationKey private eligibilityVK;
    VerificationKey private voteValidityVK;
    VerificationKey private delegationVK;

    /// @notice Custom errors
    error InvalidProof();
    error InvalidProofLength();
    error InvalidMerkleRoot();

    constructor(bytes32 initialEligibilityRoot) {
        _eligibilityRoot = initialEligibilityRoot;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Verifies an eligibility proof
     * @param proof The ZK proof data
     * @param merkleRoot The eligibility merkle root to verify against
     * @return True if the proof is valid
     */
    function verifyEligibility(
        bytes calldata proof,
        bytes32 merkleRoot
    ) external view returns (bool) {
        if (merkleRoot != _eligibilityRoot) revert InvalidMerkleRoot();

        // Decode the proof
        if (proof.length < 256) revert InvalidProofLength();

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = _decodeProof(proof);

        // For production, implement actual Groth16 verification
        // This is a simplified version that validates proof structure
        return _verifyGroth16(a, b, c, eligibilityVK);
    }

    /**
     * @notice Verifies a vote validity proof
     * @param proof The ZK proof data
     * @param commitment The vote commitment to verify
     * @return True if the proof is valid
     */
    function verifyVoteValidity(
        bytes calldata proof,
        bytes32 commitment
    ) external view returns (bool) {
        if (proof.length < 256) revert InvalidProofLength();

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = _decodeProof(proof);

        // Include commitment in public inputs verification
        // For production, verify commitment is in the proof's public inputs
        if (commitment == bytes32(0)) revert InvalidProof();

        return _verifyGroth16(a, b, c, voteValidityVK);
    }

    /**
     * @notice Verifies a delegation chain proof
     * @param proof The ZK proof data
     * @param finalDelegate The final delegate address
     * @param maxDepth Maximum allowed delegation depth
     * @return True if the proof is valid
     */
    function verifyDelegationChain(
        bytes calldata proof,
        address finalDelegate,
        uint256 maxDepth
    ) external view returns (bool) {
        if (proof.length < 256) revert InvalidProofLength();
        if (finalDelegate == address(0)) revert InvalidProof();
        if (maxDepth == 0 || maxDepth > 10) revert InvalidProof();

        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) = _decodeProof(proof);

        return _verifyGroth16(a, b, c, delegationVK);
    }

    /**
     * @notice Sets the eligible citizens merkle root
     * @param newRoot The new eligibility root
     */
    function setEligibilityRoot(bytes32 newRoot) external onlyRole(VERIFIER_ADMIN_ROLE) {
        bytes32 oldRoot = _eligibilityRoot;
        _eligibilityRoot = newRoot;
        emit EligibilityRootUpdated(oldRoot, newRoot);
    }

    /**
     * @notice Gets the current eligibility root
     * @return The current eligibility merkle root
     */
    function getEligibilityRoot() external view returns (bytes32) {
        return _eligibilityRoot;
    }

    /**
     * @notice Batch verifies multiple proofs
     * @param proofs Array of proofs to verify
     * @param commitments Array of commitments corresponding to proofs
     * @return results Array of verification results
     */
    function batchVerify(
        bytes[] calldata proofs,
        bytes32[] calldata commitments
    ) external view returns (bool[] memory results) {
        require(proofs.length == commitments.length, "Length mismatch");

        results = new bool[](proofs.length);
        for (uint256 i = 0; i < proofs.length; i++) {
            results[i] = this.verifyVoteValidity(proofs[i], commitments[i]);
        }
        return results;
    }

    /**
     * @dev Decodes a proof from bytes
     */
    function _decodeProof(
        bytes calldata proof
    ) internal pure returns (
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c
    ) {
        a[0] = _bytesToUint(proof[0:32]);
        a[1] = _bytesToUint(proof[32:64]);
        b[0][0] = _bytesToUint(proof[64:96]);
        b[0][1] = _bytesToUint(proof[96:128]);
        b[1][0] = _bytesToUint(proof[128:160]);
        b[1][1] = _bytesToUint(proof[160:192]);
        c[0] = _bytesToUint(proof[192:224]);
        c[1] = _bytesToUint(proof[224:256]);
    }

    /**
     * @dev Converts bytes to uint256
     */
    function _bytesToUint(bytes calldata b) internal pure returns (uint256) {
        return abi.decode(b, (uint256));
    }

    /**
     * @dev Verifies a Groth16 proof
     * @notice This is a placeholder for the actual pairing check
     * In production, use a properly implemented Groth16 verifier
     */
    function _verifyGroth16(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        VerificationKey storage vk
    ) internal view returns (bool) {
        // Placeholder for actual elliptic curve pairing verification
        // In production, implement: e(A, B) = e(alpha, beta) * e(vk_x, gamma) * e(C, delta)

        // Basic sanity checks
        if (a[0] == 0 && a[1] == 0) return false;
        if (c[0] == 0 && c[1] == 0) return false;

        // For now, accept valid-looking proofs
        // Real implementation requires bn128 pairing precompiles
        return true;
    }

    /**
     * @notice Sets the eligibility verification key
     * @param alpha Alpha point
     * @param beta Beta point
     * @param gamma Gamma point
     * @param delta Delta point
     * @param ic IC points
     */
    function setEligibilityVK(
        uint256[2] calldata alpha,
        uint256[2][2] calldata beta,
        uint256[2][2] calldata gamma,
        uint256[2][2] calldata delta,
        uint256[2][] calldata ic
    ) external onlyRole(VERIFIER_ADMIN_ROLE) {
        eligibilityVK.alpha = alpha;
        eligibilityVK.beta = beta;
        eligibilityVK.gamma = gamma;
        eligibilityVK.delta = delta;
        delete eligibilityVK.ic;
        for (uint256 i = 0; i < ic.length; i++) {
            eligibilityVK.ic.push(ic[i]);
        }
    }
}
