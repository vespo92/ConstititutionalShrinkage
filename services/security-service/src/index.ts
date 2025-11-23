/**
 * Security Service - Main Entry Point
 *
 * Comprehensive security hardening service for the Constitutional
 * Shrinkage platform including threat detection, incident response,
 * compliance monitoring, and audit logging.
 *
 * @module @constitutional-shrinkage/security-service
 */

// ============================================================================
// SERVER START
// ============================================================================

import { startServer } from './app.js';

// Start server if this is the main module
startServer();

// ============================================================================
// EXPORTS FOR OTHER SERVICES
// ============================================================================

// Types
export type {
  SecurityEvent,
  Threat,
  ThreatIndicator,
  Incident,
  IncidentTimelineEntry,
  Anomaly,
  ZeroTrustPolicy,
  NetworkPolicy,
  RBACPolicy,
  ABACPolicy,
  ComplianceCheck,
  ComplianceReport,
  SOC2TrustServiceCriteria,
  SOC2Category,
  FedRAMPControl,
  POAMItem,
  AuditLog,
  GeoLocation,
  AuditQuery,
  DetectionRule,
  Baseline,
  BehaviorAnalysis,
  FraudIndicator,
  WAFRule,
  WAFEvent,
  IPReputation,
  RemediationResult,
  Playbook,
  PlaybookStep,
  ForensicsBundle,
  ForensicsArtifact,
  Secret,
  VaultPolicy,
} from './types/index.js';

export {
  ThreatLevel,
  IncidentStatus,
  IncidentPriority,
  ThreatType,
  ComplianceFramework,
  AuditAction,
  DeviceTrustLevel,
} from './types/index.js';

// Crypto utilities
export {
  encrypt,
  decrypt,
  encryptWithPassword,
  decryptWithPassword,
  generateSecureToken,
  secureRandomInt,
  secureCompare,
  generateKeyPair,
  sign,
  verify,
  deriveKey,
} from './lib/crypto.js';

// Hashing utilities
export {
  sha256,
  sha512,
  hmacSha256,
  hmacSha512,
  createAuditHash,
  verifyAuditChain,
  hashFile,
  hashWithSalt,
  verifySaltedHash,
  requestFingerprint,
  contentHash,
} from './lib/hashing.js';

// Secrets management
export {
  getSecret,
  setSecret,
  deleteSecret,
  listSecrets,
  rotateSecret,
  getSecretMetadata,
  getDatabaseCredentials,
  transitEncrypt,
  transitDecrypt,
} from './lib/secrets.js';

// Audit logging
export { auditLog } from './services/audit/logger.js';

// App builder (for testing or custom deployments)
export { buildApp, startServer } from './app.js';
