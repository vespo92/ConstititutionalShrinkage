// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BillRegistry
 * @notice Immutable on-chain registry for bill hashes
 * @dev Anchors bill content hashes for verification and audit
 */
contract BillRegistry is AccessControl {
    bytes32 public constant BILL_REGISTRAR_ROLE = keccak256("BILL_REGISTRAR_ROLE");

    /// @notice Bill status enum
    enum BillStatus {
        DRAFT,
        SUBMITTED,
        VOTING,
        PASSED,
        REJECTED,
        ENACTED
    }

    /// @notice Represents a registered bill
    struct Bill {
        bytes32 contentHash;
        bytes32 titleHash;
        uint256 registeredAt;
        uint256 lastUpdated;
        BillStatus status;
        string externalId; // Off-chain bill ID
        address registrar;
        bytes32[] amendments; // Hashes of amendments
    }

    /// @notice Mapping of bill ID to bill data
    mapping(bytes32 => Bill) public bills;

    /// @notice Mapping of external ID to bill ID
    mapping(string => bytes32) public externalIdToBillId;

    /// @notice Array of all bill IDs
    bytes32[] public allBillIds;

    /// @notice Emitted when a bill is registered
    event BillRegistered(
        bytes32 indexed billId,
        bytes32 contentHash,
        string externalId,
        address registrar
    );

    /// @notice Emitted when a bill status is updated
    event BillStatusUpdated(
        bytes32 indexed billId,
        BillStatus oldStatus,
        BillStatus newStatus
    );

    /// @notice Emitted when an amendment is added
    event AmendmentAdded(
        bytes32 indexed billId,
        bytes32 amendmentHash,
        uint256 amendmentIndex
    );

    /// @notice Custom errors
    error BillAlreadyExists();
    error BillNotFound();
    error InvalidBillHash();
    error InvalidStatusTransition();
    error EmptyExternalId();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BILL_REGISTRAR_ROLE, msg.sender);
    }

    /**
     * @notice Registers a new bill
     * @param billId Unique identifier for the bill
     * @param contentHash Hash of the bill content
     * @param titleHash Hash of the bill title
     * @param externalId External reference ID
     */
    function registerBill(
        bytes32 billId,
        bytes32 contentHash,
        bytes32 titleHash,
        string calldata externalId
    ) external onlyRole(BILL_REGISTRAR_ROLE) {
        if (contentHash == bytes32(0)) revert InvalidBillHash();
        if (bytes(externalId).length == 0) revert EmptyExternalId();
        if (bills[billId].contentHash != bytes32(0)) revert BillAlreadyExists();
        if (externalIdToBillId[externalId] != bytes32(0)) revert BillAlreadyExists();

        bills[billId] = Bill({
            contentHash: contentHash,
            titleHash: titleHash,
            registeredAt: block.timestamp,
            lastUpdated: block.timestamp,
            status: BillStatus.DRAFT,
            externalId: externalId,
            registrar: msg.sender,
            amendments: new bytes32[](0)
        });

        externalIdToBillId[externalId] = billId;
        allBillIds.push(billId);

        emit BillRegistered(billId, contentHash, externalId, msg.sender);
    }

    /**
     * @notice Updates bill status
     * @param billId The bill ID
     * @param newStatus The new status
     */
    function updateStatus(
        bytes32 billId,
        BillStatus newStatus
    ) external onlyRole(BILL_REGISTRAR_ROLE) {
        Bill storage bill = bills[billId];
        if (bill.contentHash == bytes32(0)) revert BillNotFound();

        BillStatus oldStatus = bill.status;

        // Validate status transitions
        if (!_isValidTransition(oldStatus, newStatus)) revert InvalidStatusTransition();

        bill.status = newStatus;
        bill.lastUpdated = block.timestamp;

        emit BillStatusUpdated(billId, oldStatus, newStatus);
    }

    /**
     * @notice Adds an amendment to a bill
     * @param billId The bill ID
     * @param amendmentHash Hash of the amendment content
     */
    function addAmendment(
        bytes32 billId,
        bytes32 amendmentHash
    ) external onlyRole(BILL_REGISTRAR_ROLE) {
        Bill storage bill = bills[billId];
        if (bill.contentHash == bytes32(0)) revert BillNotFound();
        if (amendmentHash == bytes32(0)) revert InvalidBillHash();

        bill.amendments.push(amendmentHash);
        bill.lastUpdated = block.timestamp;

        emit AmendmentAdded(billId, amendmentHash, bill.amendments.length - 1);
    }

    /**
     * @notice Gets a bill by ID
     * @param billId The bill ID
     * @return The bill struct
     */
    function getBill(bytes32 billId) external view returns (Bill memory) {
        if (bills[billId].contentHash == bytes32(0)) revert BillNotFound();
        return bills[billId];
    }

    /**
     * @notice Gets bill by external ID
     * @param externalId The external ID
     * @return The bill struct
     */
    function getBillByExternalId(string calldata externalId) external view returns (Bill memory) {
        bytes32 billId = externalIdToBillId[externalId];
        if (billId == bytes32(0)) revert BillNotFound();
        return bills[billId];
    }

    /**
     * @notice Verifies bill content hash
     * @param billId The bill ID
     * @param contentHash The content hash to verify
     * @return True if the hash matches
     */
    function verifyBillHash(bytes32 billId, bytes32 contentHash) external view returns (bool) {
        return bills[billId].contentHash == contentHash;
    }

    /**
     * @notice Gets all amendments for a bill
     * @param billId The bill ID
     * @return Array of amendment hashes
     */
    function getAmendments(bytes32 billId) external view returns (bytes32[] memory) {
        if (bills[billId].contentHash == bytes32(0)) revert BillNotFound();
        return bills[billId].amendments;
    }

    /**
     * @notice Gets total number of registered bills
     * @return The count of bills
     */
    function getBillCount() external view returns (uint256) {
        return allBillIds.length;
    }

    /**
     * @notice Validates status transitions
     */
    function _isValidTransition(
        BillStatus from,
        BillStatus to
    ) internal pure returns (bool) {
        if (from == BillStatus.DRAFT) {
            return to == BillStatus.SUBMITTED;
        } else if (from == BillStatus.SUBMITTED) {
            return to == BillStatus.VOTING || to == BillStatus.DRAFT;
        } else if (from == BillStatus.VOTING) {
            return to == BillStatus.PASSED || to == BillStatus.REJECTED;
        } else if (from == BillStatus.PASSED) {
            return to == BillStatus.ENACTED;
        }
        return false;
    }
}
