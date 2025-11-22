# Constitutional Framework API

> Core constitutional framework defining immutable rights and law validation.

## Installation

```typescript
import {
  ConstitutionalFramework,
  constitutionalFramework,
  IMMUTABLE_RIGHTS,
  validateLaw,
} from '@constitutional-shrinkage/constitutional-framework';
```

## Overview

The Constitutional Framework package provides:
- 7 immutable rights that cannot be overridden by legislation
- Law validation against constitutional constraints
- Conflict detection and resolution
- Compatibility checking between regional and federal laws

---

## Class: ConstitutionalFramework

### Constructor

```typescript
const framework = new ConstitutionalFramework();
```

Creates a new instance with the default constitution containing all immutable rights.

---

### Methods

#### `validateLaw(law: Law): ValidationResult`

Validates a proposed law against the constitution.

**Parameters:**
- `law: Law` - The law to validate

**Returns:** `ValidationResult`
- `valid: boolean` - Whether the law passes validation
- `errors: ValidationError[]` - Critical issues that prevent passage
- `warnings: ValidationWarning[]` - Non-critical concerns

**Example:**
```typescript
const law: Law = {
  id: 'law-001',
  title: 'Environmental Protection Act',
  content: 'All businesses must report carbon emissions annually.',
  version: '1.0.0',
  level: GovernanceLevel.FEDERAL,
  status: LawStatus.DRAFT,
  sunsetDate: new Date('2030-01-01'),
  gitBranch: 'bill/environmental-protection',
  createdBy: 'senator-1',
  createdAt: new Date(),
};

const result = framework.validateLaw(law);

if (!result.valid) {
  console.log('Validation errors:', result.errors);
}
```

**Validation Checks:**
1. Constitutional conflicts (violations of immutable rights)
2. Sunset date requirement (all laws must expire)
3. Content validation (must not be empty)

---

#### `checkConflicts(law: Law): ConflictResult`

Checks for conflicts between a proposed law and constitutional rights.

**Parameters:**
- `law: Law` - The law to check

**Returns:** `ConflictResult`
- `hasConflict: boolean` - Whether conflicts exist
- `conflicts: Conflict[]` - List of detected conflicts
- `resolution?: Resolution` - Suggested resolution steps

**Example:**
```typescript
const result = framework.checkConflicts(myLaw);

if (result.hasConflict) {
  result.conflicts.forEach(conflict => {
    console.log(`Conflict with ${conflict.rightId}: ${conflict.description}`);
    console.log(`Severity: ${conflict.severity}`);
    console.log(`Suggested action: ${conflict.suggestedAction}`);
  });
}
```

**Conflict Severities:**
- `CONSTITUTIONAL_VIOLATION` - Blocks passage, requires amendment
- `LEGAL_CONFLICT` - Requires resolution before voting
- `WARNING` - Non-blocking, informational

---

#### `checkCompatibility(regionalLaw: Law, federalLaw: Law): boolean`

Checks if a regional law is compatible with federal law.

**Parameters:**
- `regionalLaw: Law` - The regional law to check
- `federalLaw: Law` - The federal law to check against

**Returns:** `boolean` - Whether the laws are compatible

**Example:**
```typescript
const isCompatible = framework.checkCompatibility(stateLaw, federalLaw);

if (!isCompatible) {
  console.log('State law conflicts with federal law');
}
```

**Compatibility Rules:**
- Regional laws can ADD to federal protections
- Regional laws CANNOT subtract from federal protections
- Both must be constitutionally valid

---

#### `getApplicableRights(level: GovernanceLevel): Right[]`

Gets rights that apply at a specific governance level.

**Parameters:**
- `level: GovernanceLevel` - The governance level

**Returns:** `Right[]` - Array of applicable rights

**Example:**
```typescript
const rights = framework.getApplicableRights(GovernanceLevel.REGIONAL);
console.log(`${rights.length} rights apply at regional level`);
```

---

#### `getConstitution(): Constitution`

Returns a copy of the current constitution.

**Returns:** `Constitution` - The full constitution object

---

#### `getImmutableRights(): Right[]`

Returns a copy of all immutable rights.

**Returns:** `Right[]` - Array of immutable rights

---

## Constants

### `IMMUTABLE_RIGHTS`

Array of 7 immutable rights:

| ID | Category | Title |
|----|----------|-------|
| `right-001` | INDIVIDUAL_SOVEREIGNTY | Right to Self-Determination |
| `right-002` | FREEDOM_OF_EXPRESSION | Freedom of Speech and Association |
| `right-003` | PRIVACY | Right to Privacy in the Home |
| `right-004` | DUE_PROCESS | Right to Due Process |
| `right-005` | ANTI_COERCION | Freedom from Victimless Crime Prosecution |
| `right-006` | PROPERTY_RIGHTS | Right to Property |
| `right-007` | BUSINESS_TRANSPARENCY | Right to Business Transparency |

---

## Types

### `Law`

```typescript
interface Law {
  id: string;
  title: string;
  content: string;
  version: string;
  level: GovernanceLevel;
  regionId?: string;
  status: LawStatus;
  sunsetDate: Date;
  gitBranch: string;
  gitCommitHash?: string;
  parentLawId?: string;
  createdBy: string;
  createdAt: Date;
  ratifiedAt?: Date;
  effectiveDate?: Date;
  repealedAt?: Date;
}
```

### `Right`

```typescript
interface Right {
  id: string;
  category: RightCategory;
  title: string;
  description: string;
  level: GovernanceLevel;
  enforceable: boolean;
  exceptions: Exception[];
  createdAt: Date;
  lastModified: Date;
}
```

### `GovernanceLevel`

```typescript
enum GovernanceLevel {
  IMMUTABLE = 'IMMUTABLE',   // Cannot be changed
  FEDERAL = 'FEDERAL',       // National level
  REGIONAL = 'REGIONAL',     // State/regional level
  LOCAL = 'LOCAL',           // Municipal level
}
```

### `RightCategory`

```typescript
enum RightCategory {
  INDIVIDUAL_SOVEREIGNTY = 'INDIVIDUAL_SOVEREIGNTY',
  FREEDOM_OF_EXPRESSION = 'FREEDOM_OF_EXPRESSION',
  PRIVACY = 'PRIVACY',
  DUE_PROCESS = 'DUE_PROCESS',
  ANTI_COERCION = 'ANTI_COERCION',
  PROPERTY_RIGHTS = 'PROPERTY_RIGHTS',
  BUSINESS_TRANSPARENCY = 'BUSINESS_TRANSPARENCY',
}
```

### `ConflictSeverity`

```typescript
enum ConflictSeverity {
  CONSTITUTIONAL_VIOLATION = 'CONSTITUTIONAL_VIOLATION',
  LEGAL_CONFLICT = 'LEGAL_CONFLICT',
  MINOR = 'MINOR',
  WARNING = 'WARNING',
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### `ValidationError`

```typescript
interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'critical' | 'error';
}
```

---

## Usage Examples

### Basic Law Validation

```typescript
import {
  constitutionalFramework,
  GovernanceLevel,
  LawStatus,
} from '@constitutional-shrinkage/constitutional-framework';

// Create a law
const environmentalLaw = {
  id: 'law-env-001',
  title: 'Clean Air Act',
  content: 'Businesses must reduce emissions by 50% by 2030.',
  version: '1.0.0',
  level: GovernanceLevel.FEDERAL,
  status: LawStatus.DRAFT,
  sunsetDate: new Date('2035-01-01'),
  gitBranch: 'bill/clean-air',
  createdBy: 'senator-green',
  createdAt: new Date(),
};

// Validate
const result = constitutionalFramework.validateLaw(environmentalLaw);

if (result.valid) {
  console.log('Law is constitutionally valid!');
} else {
  console.log('Validation failed:');
  result.errors.forEach(e => console.log(`  - ${e.message}`));
}
```

### Checking for Conflicts

```typescript
// A law that might violate privacy rights
const surveillanceLaw = {
  id: 'law-surv-001',
  title: 'Public Safety Monitoring Act',
  content: 'Mandatory surveillance and required tracking of all citizens in public spaces.',
  version: '1.0.0',
  level: GovernanceLevel.FEDERAL,
  status: LawStatus.DRAFT,
  sunsetDate: new Date('2030-01-01'),
  gitBranch: 'bill/surveillance',
  createdBy: 'senator-security',
  createdAt: new Date(),
};

const conflicts = constitutionalFramework.checkConflicts(surveillanceLaw);

if (conflicts.hasConflict) {
  console.log('Constitutional conflicts detected!');
  conflicts.conflicts.forEach(c => {
    console.log(`  Right violated: ${c.rightId}`);
    console.log(`  Description: ${c.description}`);
    console.log(`  Action needed: ${c.suggestedAction}`);
  });
}
```

### Regional vs Federal Compatibility

```typescript
// Federal law
const federalMinWage = {
  id: 'law-fed-wage',
  title: 'Federal Minimum Wage Act',
  content: 'Minimum wage is $15/hour nationwide.',
  level: GovernanceLevel.FEDERAL,
  // ...other fields
};

// State law (more generous - compatible)
const stateMinWage = {
  id: 'law-ca-wage',
  title: 'California Minimum Wage Act',
  content: 'Minimum wage is $20/hour in California.',
  level: GovernanceLevel.REGIONAL,
  regionId: 'CA',
  // ...other fields
};

const compatible = constitutionalFramework.checkCompatibility(stateMinWage, federalMinWage);
console.log(`State law is ${compatible ? 'compatible' : 'incompatible'} with federal law`);
```

---

## Best Practices

1. **Always validate before voting** - Run validation before any bill enters the voting process
2. **Check conflicts early** - Identify constitutional issues during drafting, not after
3. **Include sunset dates** - All laws require expiration dates
4. **Document exceptions** - If a law requires a constitutional exception, document the justification
