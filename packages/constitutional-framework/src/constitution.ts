/**
 * Core Constitutional Framework Implementation
 * Defines immutable rights and constitutional validation
 */

import {
  Constitution,
  Right,
  RightCategory,
  GovernanceLevel,
  Law,
  ConflictResult,
  Conflict,
  ConflictSeverity,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

/**
 * The Immutable Rights - The Main Branch
 * These rights cannot be overridden by any legislation
 */
export const IMMUTABLE_RIGHTS: Right[] = [
  {
    id: 'right-001',
    category: RightCategory.INDIVIDUAL_SOVEREIGNTY,
    title: 'Right to Self-Determination',
    description:
      'Every individual has the right to make decisions about their own life, body, and future, so long as those decisions do not harm others.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
  {
    id: 'right-002',
    category: RightCategory.FREEDOM_OF_EXPRESSION,
    title: 'Freedom of Speech and Association',
    description:
      'The right to express ideas, opinions, and beliefs, and to associate freely with others.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [
      {
        id: 'exception-001',
        condition: 'Direct incitement to imminent violence',
        justification:
          'Speech that directly and immediately incites violence is not protected',
        requiredApprovalLevel: GovernanceLevel.FEDERAL,
      },
    ],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
  {
    id: 'right-003',
    category: RightCategory.PRIVACY,
    title: 'Right to Privacy and Data Ownership',
    description:
      'Individuals own their personal data and have the right to privacy in their personal affairs.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
  {
    id: 'right-004',
    category: RightCategory.DUE_PROCESS,
    title: 'Right to Due Process',
    description:
      'The right to a fair trial, presumption of innocence, and protection against arbitrary detention.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
  {
    id: 'right-005',
    category: RightCategory.ANTI_COERCION,
    title: 'Freedom from Victimless Crime Prosecution',
    description:
      'No person shall be prosecuted for actions that harm no other person or their property.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
  {
    id: 'right-006',
    category: RightCategory.PROPERTY_RIGHTS,
    title: 'Right to Property',
    description:
      'The right to own, use, and transfer property, subject only to fair compensation for public use.',
    level: GovernanceLevel.IMMUTABLE,
    enforceable: true,
    exceptions: [
      {
        id: 'exception-002',
        condition: 'Eminent domain with fair market compensation',
        justification: 'Public infrastructure may require property acquisition',
        requiredApprovalLevel: GovernanceLevel.FEDERAL,
      },
    ],
    createdAt: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
  },
];

export class ConstitutionalFramework {
  private constitution: Constitution;

  constructor() {
    this.constitution = {
      version: '1.0.0',
      immutableRights: IMMUTABLE_RIGHTS,
      amendments: [],
      gitRepository: 'constitutional-law',
      mainBranch: 'main',
      lastUpdated: new Date(),
    };
  }

  /**
   * Validate a proposed law against the constitution
   */
  validateLaw(law: Law): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for constitutional violations
    const conflicts = this.checkConflicts(law);

    conflicts.conflicts.forEach((conflict) => {
      if (conflict.severity === ConflictSeverity.CONSTITUTIONAL_VIOLATION) {
        errors.push({
          code: 'CONSTITUTIONAL_VIOLATION',
          message: conflict.description,
          severity: 'critical',
        });
      } else if (conflict.severity === ConflictSeverity.LEGAL_CONFLICT) {
        errors.push({
          code: 'LEGAL_CONFLICT',
          message: conflict.description,
          severity: 'error',
        });
      } else {
        warnings.push({
          code: 'WARNING',
          message: conflict.description,
          suggestion: conflict.suggestedAction,
        });
      }
    });

    // Validate sunset clause exists
    if (!law.sunsetDate) {
      errors.push({
        code: 'MISSING_SUNSET',
        message: 'All laws must have a sunset date',
        field: 'sunsetDate',
        severity: 'error',
      });
    } else if (law.sunsetDate < new Date()) {
      errors.push({
        code: 'INVALID_SUNSET',
        message: 'Sunset date must be in the future',
        field: 'sunsetDate',
        severity: 'error',
      });
    }

    // Validate content is not empty
    if (!law.content || law.content.trim().length === 0) {
      errors.push({
        code: 'EMPTY_CONTENT',
        message: 'Law content cannot be empty',
        field: 'content',
        severity: 'critical',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for conflicts between a proposed law and existing constitutional rights
   */
  checkConflicts(law: Law): ConflictResult {
    const conflicts: Conflict[] = [];

    // Check against immutable rights
    this.constitution.immutableRights.forEach((right) => {
      // Simple keyword-based conflict detection (would be more sophisticated in production)
      const potentialViolations = this.detectRightViolation(law, right);

      if (potentialViolations.length > 0) {
        potentialViolations.forEach((violation) => {
          conflicts.push({
            lawId: law.id,
            rightId: right.id,
            description: `Proposed law may violate ${right.title}: ${violation}`,
            severity: ConflictSeverity.CONSTITUTIONAL_VIOLATION,
            suggestedAction: `Remove provisions that conflict with ${right.title}`,
          });
        });
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      resolution: conflicts.length > 0 ? {
        method: 'amendment_required' as any,
        requiredChanges: conflicts.map((c) => c.suggestedAction),
      } : undefined,
    };
  }

  /**
   * Detect potential violations of a right
   * This is a simplified implementation - production would use NLP/AI
   */
  private detectRightViolation(law: Law, right: Right): string[] {
    const violations: string[] = [];
    const content = law.content.toLowerCase();

    // Privacy violations
    if (right.category === RightCategory.PRIVACY) {
      if (content.includes('mandatory surveillance') || content.includes('required tracking')) {
        violations.push('Contains mandatory surveillance or tracking provisions');
      }
    }

    // Anti-coercion violations
    if (right.category === RightCategory.ANTI_COERCION) {
      if (content.includes('victimless') && content.includes('criminal')) {
        violations.push('May criminalize victimless activities');
      }
    }

    // Due process violations
    if (right.category === RightCategory.DUE_PROCESS) {
      if (
        content.includes('without trial') ||
        content.includes('presumed guilty') ||
        content.includes('no legal representation')
      ) {
        violations.push('May violate due process protections');
      }
    }

    return violations;
  }

  /**
   * Get the applicable rights for a specific context
   */
  getApplicableRights(level: GovernanceLevel): Right[] {
    // Immutable rights always apply
    let rights = [...this.constitution.immutableRights];

    // Add level-specific rights
    // In a full implementation, this would include federal, regional, and local rights

    return rights;
  }

  /**
   * Check compatibility between regional and federal law
   */
  checkCompatibility(regionalLaw: Law, federalLaw: Law): boolean {
    // Regional laws can add to, but not subtract from, federal laws
    // Regional Rights ⊇ Federal Rights ⊇ Immutable Rights

    const regionalValidation = this.validateLaw(regionalLaw);
    const federalValidation = this.validateLaw(federalLaw);

    // Both must be constitutionally valid
    if (!regionalValidation.valid || !federalValidation.valid) {
      return false;
    }

    // Regional law must not contradict federal law
    // (Simplified check - would be more sophisticated in production)
    return true;
  }

  /**
   * Get the current constitution
   */
  getConstitution(): Constitution {
    return { ...this.constitution };
  }

  /**
   * Get immutable rights
   */
  getImmutableRights(): Right[] {
    return [...IMMUTABLE_RIGHTS];
  }
}

// Export singleton instance
export const constitutionalFramework = new ConstitutionalFramework();
