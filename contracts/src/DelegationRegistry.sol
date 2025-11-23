// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DelegationRegistry
 * @notice On-chain tracking of vote delegations
 * @dev Supports multi-level delegation with depth limits
 */
contract DelegationRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DELEGATION_ADMIN_ROLE = keccak256("DELEGATION_ADMIN_ROLE");

    /// @notice Maximum delegation chain depth
    uint256 public constant MAX_DELEGATION_DEPTH = 5;

    /// @notice Represents a delegation
    struct Delegation {
        address delegate;
        uint256 timestamp;
        bytes32 categoryHash; // Optional category-specific delegation
        bool active;
    }

    /// @notice Mapping of delegator to their delegations
    mapping(address => Delegation) public delegations;

    /// @notice Mapping of delegator to category to delegation
    mapping(address => mapping(bytes32 => Delegation)) public categoryDelegations;

    /// @notice Mapping to track delegation count per delegate
    mapping(address => uint256) public delegationCount;

    /// @notice Emitted when a delegation is created
    event DelegationCreated(
        address indexed delegator,
        address indexed delegate,
        bytes32 category,
        uint256 timestamp
    );

    /// @notice Emitted when a delegation is revoked
    event DelegationRevoked(
        address indexed delegator,
        address indexed previousDelegate,
        bytes32 category
    );

    /// @notice Emitted when a delegation is transferred
    event DelegationTransferred(
        address indexed delegator,
        address indexed oldDelegate,
        address indexed newDelegate
    );

    /// @notice Custom errors
    error SelfDelegation();
    error DelegationLoopDetected();
    error MaxDepthExceeded();
    error NoDelegationExists();
    error DelegationAlreadyExists();
    error InvalidDelegate();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DELEGATION_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Creates a new delegation
     * @param delegate The address to delegate to
     */
    function delegate(address delegate) external nonReentrant {
        _delegate(msg.sender, delegate, bytes32(0));
    }

    /**
     * @notice Creates a category-specific delegation
     * @param _delegate The address to delegate to
     * @param category The category hash for the delegation
     */
    function delegateByCategory(address _delegate, bytes32 category) external nonReentrant {
        _delegate(msg.sender, _delegate, category);
    }

    /**
     * @notice Internal delegation logic
     */
    function _delegate(address delegator, address _delegate, bytes32 category) internal {
        if (_delegate == address(0)) revert InvalidDelegate();
        if (_delegate == delegator) revert SelfDelegation();

        // Check for delegation loops
        if (_wouldCreateLoop(delegator, _delegate, category)) revert DelegationLoopDetected();

        // Check delegation depth
        uint256 depth = _getDelegationDepth(_delegate, category);
        if (depth >= MAX_DELEGATION_DEPTH) revert MaxDepthExceeded();

        Delegation storage del;
        if (category == bytes32(0)) {
            del = delegations[delegator];
        } else {
            del = categoryDelegations[delegator][category];
        }

        address previousDelegate = del.delegate;

        // Update delegation counts
        if (del.active && previousDelegate != address(0)) {
            delegationCount[previousDelegate]--;
        }

        del.delegate = _delegate;
        del.timestamp = block.timestamp;
        del.categoryHash = category;
        del.active = true;

        delegationCount[_delegate]++;

        emit DelegationCreated(delegator, _delegate, category, block.timestamp);
    }

    /**
     * @notice Revokes the sender's delegation
     */
    function revokeDelegation() external {
        _revoke(msg.sender, bytes32(0));
    }

    /**
     * @notice Revokes a category-specific delegation
     * @param category The category to revoke delegation for
     */
    function revokeCategoryDelegation(bytes32 category) external {
        _revoke(msg.sender, category);
    }

    /**
     * @notice Internal revoke logic
     */
    function _revoke(address delegator, bytes32 category) internal {
        Delegation storage del;
        if (category == bytes32(0)) {
            del = delegations[delegator];
        } else {
            del = categoryDelegations[delegator][category];
        }

        if (!del.active) revert NoDelegationExists();

        address previousDelegate = del.delegate;
        delegationCount[previousDelegate]--;

        del.active = false;
        del.delegate = address(0);

        emit DelegationRevoked(delegator, previousDelegate, category);
    }

    /**
     * @notice Gets the final delegate for an address
     * @param delegator The address to resolve delegation for
     * @return The final delegate address
     */
    function getFinalDelegate(address delegator) external view returns (address) {
        return _resolveDelegation(delegator, bytes32(0), 0);
    }

    /**
     * @notice Gets the final delegate for a category
     * @param delegator The address to resolve delegation for
     * @param category The category to check
     * @return The final delegate address
     */
    function getFinalDelegateByCategory(
        address delegator,
        bytes32 category
    ) external view returns (address) {
        return _resolveDelegation(delegator, category, 0);
    }

    /**
     * @notice Resolves the delegation chain
     */
    function _resolveDelegation(
        address current,
        bytes32 category,
        uint256 depth
    ) internal view returns (address) {
        if (depth > MAX_DELEGATION_DEPTH) return current;

        Delegation storage del;
        if (category == bytes32(0)) {
            del = delegations[current];
        } else {
            del = categoryDelegations[current][category];
        }

        if (!del.active || del.delegate == address(0)) {
            return current;
        }

        return _resolveDelegation(del.delegate, category, depth + 1);
    }

    /**
     * @notice Checks if delegation would create a loop
     */
    function _wouldCreateLoop(
        address delegator,
        address _delegate,
        bytes32 category
    ) internal view returns (bool) {
        address current = _delegate;
        for (uint256 i = 0; i <= MAX_DELEGATION_DEPTH; i++) {
            if (current == delegator) return true;

            Delegation storage del;
            if (category == bytes32(0)) {
                del = delegations[current];
            } else {
                del = categoryDelegations[current][category];
            }

            if (!del.active || del.delegate == address(0)) break;
            current = del.delegate;
        }
        return false;
    }

    /**
     * @notice Gets the delegation depth for an address
     */
    function _getDelegationDepth(
        address _delegate,
        bytes32 category
    ) internal view returns (uint256) {
        uint256 depth = 0;
        address current = _delegate;

        while (depth < MAX_DELEGATION_DEPTH) {
            Delegation storage del;
            if (category == bytes32(0)) {
                del = delegations[current];
            } else {
                del = categoryDelegations[current][category];
            }

            if (!del.active || del.delegate == address(0)) break;
            current = del.delegate;
            depth++;
        }

        return depth;
    }

    /**
     * @notice Gets the delegation chain for an address
     * @param delegator The starting address
     * @return chain Array of addresses in the delegation chain
     */
    function getDelegationChain(address delegator) external view returns (address[] memory chain) {
        address[] memory tempChain = new address[](MAX_DELEGATION_DEPTH + 1);
        uint256 count = 0;
        address current = delegator;

        while (count <= MAX_DELEGATION_DEPTH) {
            tempChain[count] = current;
            count++;

            Delegation storage del = delegations[current];
            if (!del.active || del.delegate == address(0)) break;
            current = del.delegate;
        }

        chain = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            chain[i] = tempChain[i];
        }
    }
}
