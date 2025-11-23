// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AuditTrail
 * @notice Immutable on-chain audit log for voting activities
 * @dev Records all significant events for transparency and verification
 */
contract AuditTrail is AccessControl {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

    /// @notice Audit event types
    enum AuditEventType {
        SESSION_CREATED,
        VOTE_COMMITTED,
        VOTE_REVEALED,
        SESSION_FINALIZED,
        DELEGATION_CREATED,
        DELEGATION_REVOKED,
        BILL_REGISTERED,
        BILL_STATUS_CHANGED,
        ELIGIBILITY_ROOT_UPDATED,
        SYSTEM_PAUSED,
        SYSTEM_UNPAUSED
    }

    /// @notice Represents an audit entry
    struct AuditEntry {
        uint256 timestamp;
        AuditEventType eventType;
        bytes32 primaryKey; // e.g., sessionId, billId
        bytes32 secondaryKey; // e.g., commitment hash
        address actor;
        bytes32 dataHash; // Hash of additional data
        uint256 blockNumber;
    }

    /// @notice Array of all audit entries
    AuditEntry[] public auditLog;

    /// @notice Mapping of primary key to audit entry indices
    mapping(bytes32 => uint256[]) public entriesByKey;

    /// @notice Mapping of actor to audit entry indices
    mapping(address => uint256[]) public entriesByActor;

    /// @notice Mapping of event type to audit entry indices
    mapping(AuditEventType => uint256[]) public entriesByType;

    /// @notice Emitted when an audit entry is recorded
    event AuditEntryRecorded(
        uint256 indexed entryIndex,
        AuditEventType indexed eventType,
        bytes32 indexed primaryKey,
        address actor,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(RECORDER_ROLE, msg.sender);
    }

    /**
     * @notice Records a new audit entry
     * @param eventType The type of event
     * @param primaryKey Primary identifier (e.g., sessionId)
     * @param secondaryKey Secondary identifier
     * @param actor The address that performed the action
     * @param dataHash Hash of additional data
     */
    function recordEntry(
        AuditEventType eventType,
        bytes32 primaryKey,
        bytes32 secondaryKey,
        address actor,
        bytes32 dataHash
    ) external onlyRole(RECORDER_ROLE) {
        uint256 entryIndex = auditLog.length;

        AuditEntry memory entry = AuditEntry({
            timestamp: block.timestamp,
            eventType: eventType,
            primaryKey: primaryKey,
            secondaryKey: secondaryKey,
            actor: actor,
            dataHash: dataHash,
            blockNumber: block.number
        });

        auditLog.push(entry);

        // Index the entry
        entriesByKey[primaryKey].push(entryIndex);
        entriesByActor[actor].push(entryIndex);
        entriesByType[eventType].push(entryIndex);

        emit AuditEntryRecorded(entryIndex, eventType, primaryKey, actor, block.timestamp);
    }

    /**
     * @notice Records a session creation event
     * @param sessionId The session ID
     * @param billHash The bill hash
     * @param actor The creator address
     */
    function recordSessionCreated(
        bytes32 sessionId,
        bytes32 billHash,
        address actor
    ) external onlyRole(RECORDER_ROLE) {
        _record(AuditEventType.SESSION_CREATED, sessionId, billHash, actor, bytes32(0));
    }

    /**
     * @notice Records a vote commitment event
     * @param sessionId The session ID
     * @param commitment The vote commitment
     * @param actor The voter address
     */
    function recordVoteCommitted(
        bytes32 sessionId,
        bytes32 commitment,
        address actor
    ) external onlyRole(RECORDER_ROLE) {
        _record(AuditEventType.VOTE_COMMITTED, sessionId, commitment, actor, bytes32(0));
    }

    /**
     * @notice Records a vote reveal event
     * @param sessionId The session ID
     * @param actor The voter address
     * @param choiceHash Hash of the vote choice
     */
    function recordVoteRevealed(
        bytes32 sessionId,
        address actor,
        bytes32 choiceHash
    ) external onlyRole(RECORDER_ROLE) {
        _record(AuditEventType.VOTE_REVEALED, sessionId, bytes32(0), actor, choiceHash);
    }

    /**
     * @notice Records a session finalization event
     * @param sessionId The session ID
     * @param merkleRoot The final merkle root
     * @param resultsHash Hash of final vote counts
     */
    function recordSessionFinalized(
        bytes32 sessionId,
        bytes32 merkleRoot,
        bytes32 resultsHash
    ) external onlyRole(RECORDER_ROLE) {
        _record(AuditEventType.SESSION_FINALIZED, sessionId, merkleRoot, msg.sender, resultsHash);
    }

    /**
     * @notice Internal record function
     */
    function _record(
        AuditEventType eventType,
        bytes32 primaryKey,
        bytes32 secondaryKey,
        address actor,
        bytes32 dataHash
    ) internal {
        uint256 entryIndex = auditLog.length;

        auditLog.push(AuditEntry({
            timestamp: block.timestamp,
            eventType: eventType,
            primaryKey: primaryKey,
            secondaryKey: secondaryKey,
            actor: actor,
            dataHash: dataHash,
            blockNumber: block.number
        }));

        entriesByKey[primaryKey].push(entryIndex);
        entriesByActor[actor].push(entryIndex);
        entriesByType[eventType].push(entryIndex);

        emit AuditEntryRecorded(entryIndex, eventType, primaryKey, actor, block.timestamp);
    }

    /**
     * @notice Gets an audit entry by index
     * @param index The entry index
     * @return The audit entry
     */
    function getEntry(uint256 index) external view returns (AuditEntry memory) {
        require(index < auditLog.length, "Index out of bounds");
        return auditLog[index];
    }

    /**
     * @notice Gets all entries for a primary key
     * @param primaryKey The key to query
     * @return Array of audit entries
     */
    function getEntriesByKey(bytes32 primaryKey) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = entriesByKey[primaryKey];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        return entries;
    }

    /**
     * @notice Gets all entries for an actor
     * @param actor The actor address
     * @return Array of audit entries
     */
    function getEntriesByActor(address actor) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = entriesByActor[actor];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        return entries;
    }

    /**
     * @notice Gets entries by type within a time range
     * @param eventType The event type
     * @param startTime Start timestamp
     * @param endTime End timestamp
     * @return Array of audit entries
     */
    function getEntriesByTypeInRange(
        AuditEventType eventType,
        uint256 startTime,
        uint256 endTime
    ) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = entriesByType[eventType];
        uint256 count = 0;

        // Count matching entries
        for (uint256 i = 0; i < indices.length; i++) {
            AuditEntry storage entry = auditLog[indices[i]];
            if (entry.timestamp >= startTime && entry.timestamp <= endTime) {
                count++;
            }
        }

        // Build result array
        AuditEntry[] memory result = new AuditEntry[](count);
        uint256 resultIndex = 0;
        for (uint256 i = 0; i < indices.length; i++) {
            AuditEntry storage entry = auditLog[indices[i]];
            if (entry.timestamp >= startTime && entry.timestamp <= endTime) {
                result[resultIndex] = entry;
                resultIndex++;
            }
        }

        return result;
    }

    /**
     * @notice Gets total number of audit entries
     * @return The count of entries
     */
    function getEntryCount() external view returns (uint256) {
        return auditLog.length;
    }

    /**
     * @notice Generates a hash proof for an entry
     * @param index The entry index
     * @return The proof hash
     */
    function getEntryHash(uint256 index) external view returns (bytes32) {
        require(index < auditLog.length, "Index out of bounds");
        AuditEntry storage entry = auditLog[index];
        return keccak256(abi.encodePacked(
            entry.timestamp,
            entry.eventType,
            entry.primaryKey,
            entry.secondaryKey,
            entry.actor,
            entry.dataHash,
            entry.blockNumber
        ));
    }
}
