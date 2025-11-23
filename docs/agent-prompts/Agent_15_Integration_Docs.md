# Agent_15: Integration & Documentation

## Mission
Create shared UI components, shared TypeScript types, comprehensive API documentation, user guides, and developer tutorials to enable seamless integration across all applications and onboard new contributors.

## Branch
```
claude/agent-15-integration-docs-{session-id}
```

## Priority: MEDIUM

## Context
This agent provides the "glue" that ties everything together:
- Shared UI component library for consistent design
- Shared TypeScript types for API contracts
- API documentation for developers
- User guides for end-users
- Developer onboarding materials

## Target Directories
```
packages/ui/
packages/shared-types/
docs/
```

## Your Deliverables

### 1. Shared UI Component Library

#### Setup
```json
// packages/ui/package.json
{
  "name": "@constitutional/ui",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./components/*": "./dist/components/*.js"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

#### Components to Create
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── Table/
│   │   │   ├── Table.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── index.ts
│   │   ├── Form/
│   │   │   ├── Form.tsx
│   │   │   ├── FormField.tsx
│   │   │   └── index.ts
│   │   ├── Tabs/
│   │   │   ├── Tabs.tsx
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── Alert/
│   │   │   ├── Alert.tsx
│   │   │   └── index.ts
│   │   ├── Avatar/
│   │   │   ├── Avatar.tsx
│   │   │   └── index.ts
│   │   ├── Dropdown/
│   │   │   ├── Dropdown.tsx
│   │   │   └── index.ts
│   │   ├── Pagination/
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts
│   │   ├── Spinner/
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   └── Toast/
│   │       ├── Toast.tsx
│   │       ├── Toaster.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts                   # className utility
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   └── index.ts
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

#### Example Component
```typescript
// packages/ui/src/components/Button/Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        ghost: 'hover:bg-gray-100',
        link: 'text-blue-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2. Shared TypeScript Types

```
packages/shared-types/
├── src/
│   ├── api/
│   │   ├── requests.types.ts       # API request types
│   │   ├── responses.types.ts      # API response types
│   │   └── errors.types.ts         # Error types
│   ├── entities/
│   │   ├── bill.types.ts
│   │   ├── vote.types.ts
│   │   ├── delegation.types.ts
│   │   ├── person.types.ts
│   │   ├── organization.types.ts
│   │   ├── region.types.ts
│   │   └── metrics.types.ts
│   ├── auth/
│   │   ├── user.types.ts
│   │   ├── session.types.ts
│   │   └── permissions.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### Example Types
```typescript
// packages/shared-types/src/entities/bill.types.ts
export type BillStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'voting'
  | 'passed'
  | 'rejected'
  | 'enacted'
  | 'sunset';

export interface Bill {
  id: string;
  title: string;
  content: string;
  summary?: string;
  status: BillStatus;
  version: number;
  category: string;
  tags: string[];
  sponsor: PersonSummary;
  coSponsors: PersonSummary[];
  region: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  votingStartsAt?: Date;
  votingEndsAt?: Date;
  sunsetDate?: Date;
  parentBillId?: string;
  amendments: Amendment[];
  complianceScore?: number;
}

export interface BillCreateRequest {
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  region: string;
}

export interface BillUpdateRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
}

export interface BillForkRequest {
  title?: string;
  region?: string;
}

// packages/shared-types/src/api/responses.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 3. API Documentation

```
docs/
├── api/
│   ├── README.md                   # API overview
│   ├── authentication.md           # Auth guide
│   ├── bills-api.md                # Bills endpoints
│   ├── votes-api.md                # Votes endpoints
│   ├── delegations-api.md          # Delegations endpoints
│   ├── users-api.md                # Users endpoints
│   ├── metrics-api.md              # Metrics endpoints
│   ├── search-api.md               # Search endpoints
│   ├── notifications-api.md        # Notifications endpoints
│   ├── error-codes.md              # Error reference
│   └── rate-limiting.md            # Rate limits
```

#### Example API Doc
```markdown
<!-- docs/api/bills-api.md -->
# Bills API

The Bills API provides endpoints for creating, managing, and tracking legislation.

## Base URL

```
https://api.constitutional.dev/api/v1/bills
```

## Authentication

All endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### List Bills

```http
GET /api/v1/bills
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| pageSize | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status |
| category | string | Filter by category |
| region | string | Filter by region |
| search | string | Full-text search |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "bill_123",
      "title": "Infrastructure Improvement Act",
      "summary": "A bill to improve local infrastructure",
      "status": "voting",
      "category": "infrastructure",
      "sponsor": {
        "id": "person_456",
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Create Bill

```http
POST /api/v1/bills
```

#### Request Body

```json
{
  "title": "Community Health Initiative",
  "content": "# Section 1\n\nThe following provisions...",
  "summary": "A bill to establish community health centers",
  "category": "healthcare",
  "tags": ["health", "community", "access"],
  "region": "CA-SF"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "bill_789",
    "title": "Community Health Initiative",
    "status": "draft",
    "version": 1,
    ...
  }
}
```

... (more endpoints)
```

### 4. User Guides

```
docs/guides/
├── user/
│   ├── getting-started.md          # New user guide
│   ├── voting-guide.md             # How to vote
│   ├── delegation-guide.md         # Liquid democracy
│   ├── tracking-legislation.md     # Following bills
│   └── participation-guide.md      # Civic engagement
└── developer/
    ├── local-setup.md              # Dev environment
    ├── architecture.md             # System architecture
    ├── contributing.md             # Contribution guide
    ├── testing.md                  # Testing guide
    ├── deployment.md               # Deployment guide
    └── troubleshooting.md          # Common issues
```

#### Example User Guide
```markdown
<!-- docs/guides/user/voting-guide.md -->
# How to Vote

This guide explains how to participate in the democratic process by casting your vote on legislation.

## Finding Bills to Vote On

1. Log in to your Citizen Portal
2. Navigate to **Dashboard** > **Active Votes**
3. You'll see all bills currently open for voting

## Understanding a Bill

Before voting, take time to understand the legislation:

- **Summary**: A brief overview of the bill's purpose
- **Full Text**: The complete legal text
- **Impact Assessment**: Projected effects on People, Planet, and Profit (TBL)
- **Constitutional Compliance**: Whether the bill meets constitutional requirements
- **Sponsors**: Who proposed the bill
- **Amendments**: Any proposed changes

## Casting Your Vote

1. Click on a bill to view its details
2. Review all available information
3. Click **Cast Vote**
4. Choose your position:
   - **Yes**: Support the bill
   - **No**: Oppose the bill
   - **Abstain**: Neither support nor oppose
5. Optionally add a public comment explaining your vote
6. Click **Confirm Vote**

## Delegating Your Vote

If you'd prefer someone else to vote on your behalf, you can delegate your voting power. See the [Delegation Guide](./delegation-guide.md).

## Vote Verification

After voting, you can verify your vote was recorded correctly:

1. Go to **History** > **My Votes**
2. Find the bill you voted on
3. Click **Verify**
4. Your cryptographic receipt will be checked against the blockchain

## Changing Your Vote

You can change your vote before the voting period ends:

1. Go to **History** > **My Votes**
2. Find the active vote you want to change
3. Click **Change Vote**
4. Select your new position
5. Confirm the change

Note: Vote changes are recorded in the audit trail for transparency.

## FAQ

**Q: Is my vote private?**
A: Yes, your specific vote is private. Only you can see how you voted. Aggregate totals are public.

**Q: What if I forget to vote?**
A: If you've delegated your vote, your delegate will vote on your behalf. Otherwise, you can set up vote reminders in Settings.

...
```

### 5. Architecture Decision Records (ADRs)

```
docs/architecture/
├── adr/
│   ├── README.md                   # ADR index
│   ├── 001-monorepo-structure.md
│   ├── 002-liquid-democracy.md
│   ├── 003-database-choice.md
│   ├── 004-authentication.md
│   ├── 005-real-time-updates.md
│   └── 006-search-engine.md
└── diagrams/
    ├── system-context.mmd          # Mermaid diagrams
    ├── container.mmd
    └── data-flow.mmd
```

#### Example ADR
```markdown
<!-- docs/architecture/adr/002-liquid-democracy.md -->
# ADR-002: Liquid Democracy Implementation

## Status

Accepted

## Context

We need to implement a voting system that balances direct democracy with representative democracy, allowing citizens to either vote directly or delegate their voting power.

## Decision

We will implement a **liquid democracy** system with the following characteristics:

1. **Transitive Delegation**: If A delegates to B, and B delegates to C, then A's vote follows through to C
2. **Revocable**: Delegations can be revoked at any time
3. **Scoped**: Delegations can be limited to specific categories or regions
4. **Circular Detection**: The system prevents circular delegation chains

### Delegation Resolution Algorithm

```typescript
function resolveVotingPower(personId: string, billId: string): VotingPower {
  const directVote = getDirectVote(personId, billId);
  if (directVote) {
    return { type: 'direct', vote: directVote };
  }

  const delegation = getActiveDelegation(personId, billId);
  if (!delegation) {
    return { type: 'abstain' };
  }

  // Prevent circular delegation
  const visited = new Set([personId]);
  let currentDelegate = delegation.delegatee;

  while (currentDelegate) {
    if (visited.has(currentDelegate)) {
      throw new Error('Circular delegation detected');
    }
    visited.add(currentDelegate);

    const delegateVote = getDirectVote(currentDelegate, billId);
    if (delegateVote) {
      return { type: 'delegated', vote: delegateVote, chain: [...visited] };
    }

    const nextDelegation = getActiveDelegation(currentDelegate, billId);
    currentDelegate = nextDelegation?.delegatee;
  }

  return { type: 'abstain' };
}
```

## Consequences

### Positive

- Citizens can participate as much or as little as they want
- Expertise can be leveraged through delegation to trusted individuals
- More nuanced representation than pure direct or representative democracy

### Negative

- More complex to implement and explain
- Potential for power concentration if many delegate to few
- Audit trail is more complex

### Mitigations

- Clear UI explaining delegation chains
- Alerts when delegation concentration exceeds thresholds
- Easy-to-use revocation
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| UI Components | 15-20 |
| Type Definitions | 50+ |
| API Doc Pages | 10+ |
| User Guides | 5+ |
| Developer Guides | 5+ |
| ADRs | 5+ |

## Success Criteria

1. [ ] UI component library published
2. [ ] Shared types package published
3. [ ] API documentation complete
4. [ ] User guides written
5. [ ] Developer guides written
6. [ ] ADRs documented
7. [ ] All components tested
8. [ ] Examples provided

---

*Agent_15 Assignment - Integration & Documentation*
