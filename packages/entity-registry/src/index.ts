/**
 * ENTITY REGISTRY
 *
 * .git for Government - Complete tracking of WHO did WHAT, WHEN, and WHY.
 *
 * This package provides:
 * - People tracking with full identity and verification
 * - Organization tracking with ownership chains
 * - Association tracking between all entities
 * - Git-style change tracking with blame, diff, and history
 * - Conflict of interest detection
 * - Network analysis and visualization data
 *
 * Core Philosophy:
 * "Every change is recorded. Every actor is tracked. Nothing is forgotten."
 *
 * @example
 * ```typescript
 * import { entityRegistry, Person, Organization, Association } from '@constitutional/entity-registry';
 *
 * // Register a person
 * const author = { personId: 'system', personName: 'System', role: 'ADMIN', officialCapacity: true };
 * const senator = entityRegistry.registerPerson({
 *   legalName: 'Jane Smith',
 *   dateOfBirth: new Date('1970-01-15'),
 *   contactEmail: 'jane.smith@senate.gov',
 *   primaryRegionId: 'CA',
 *   regionIds: ['CA', 'US'],
 *   verificationLevel: 'FULL_KYC',
 *   votingPower: 1.0,
 *   reputation: 85,
 *   expertiseAreas: [],
 *   status: 'ACTIVE',
 *   publicKey: 'pk_...',
 * }, author);
 *
 * // Create association (bill sponsorship)
 * entityRegistry.createAssociation({
 *   associationType: 'PERSON_TO_DOCUMENT',
 *   subjectType: 'PERSON',
 *   subjectId: senator.id,
 *   subjectName: senator.legalName,
 *   objectType: 'BILL',
 *   objectId: 'bill-123',
 *   objectName: 'Infrastructure Investment Act',
 *   involvementType: 'BILL_SPONSOR',
 *   startDate: new Date(),
 *   isActive: true,
 *   significance: 'PRIMARY',
 *   verified: true,
 *   sourceDocuments: ['doc-456'],
 * }, author);
 *
 * // Get blame - who is responsible for what
 * const blame = entityRegistry.getBlame('BILL', 'bill-123');
 *
 * // Get involvement report
 * const report = entityRegistry.generateInvolvementReport(senator.id, 'PERSON');
 * ```
 */

// Export the registry singleton and class
export { EntityRegistry, entityRegistry } from './registry';

// Export all types
export * from './types';
