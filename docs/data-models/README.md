# Data Models Documentation

> Entity relationships and database schemas for Constitutional Shrinkage.

## Entity Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐         ┌──────────────┐         ┌──────────┐        │
│  │  Person  │◄───────►│  Association │◄───────►│   Bill   │        │
│  └────┬─────┘         └──────────────┘         └────┬─────┘        │
│       │                      ▲                       │              │
│       │                      │                       │              │
│       ▼                      │                       ▼              │
│  ┌──────────┐         ┌──────────────┐         ┌──────────┐        │
│  │Organization│       │  Delegation  │         │   Vote   │        │
│  └──────────┘         └──────────────┘         └──────────┘        │
│                                                                      │
│  ┌──────────┐         ┌──────────────┐         ┌──────────┐        │
│  │  Region  │         │ChangeRecord  │         │Amendment │        │
│  └──────────┘         └──────────────┘         └──────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Entity Relationships

### Person

A person is any individual tracked in the system.

```
Person
├── has many Votes
├── has many Delegations (as delegator)
├── has many Delegations (as delegate)
├── has many Associations
├── sponsors many Bills
├── co-sponsors many Bills
├── belongs to primary Region
├── belongs to many Regions
└── has many ChangeRecords
```

### Organization

Any legal entity: government agency, company, nonprofit, etc.

```
Organization
├── has many Associations
├── has many Ownership Stakes
├── belongs to Jurisdiction
├── has parent Organization (optional)
├── has many child Organizations
└── has many ChangeRecords
```

### Bill

Proposed or enacted legislation.

```
Bill
├── has many Amendments
├── has many Votes (through VotingSession)
├── has one VotingSession
├── has one Sponsor (Person)
├── has many Co-Sponsors (Persons)
├── belongs to Category
├── belongs to Region (optional)
├── has parent Bill (if forked)
└── has many ChangeRecords
```

### Association

A relationship between any two entities (the heart of tracking).

```
Association
├── has one Subject (Person or Organization)
├── has one Object (Bill, Organization, Case, etc.)
├── has many InvolvementRecords
└── has many ChangeRecords
```

### Vote

A recorded vote on a bill.

```
Vote
├── belongs to Person
├── belongs to VotingSession
├── belongs to Bill (through session)
├── has one CryptographicProof
└── has Delegation Chain (array of person IDs)
```

### Delegation

A delegation of voting power (liquid democracy).

```
Delegation
├── has one Delegator (Person)
├── has one Delegate (Person)
├── belongs to Category (optional)
├── belongs to Bill (if single-bill scope)
└── has Scope (ALL, CATEGORY, SINGLE_BILL)
```

---

## Entity-Relationship Diagram (ERD)

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Person    │       │   Association   │       │Organization │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id          │       │ id              │       │ id          │
│ legalName   │◄──────┤ subjectId       │       │ legalName   │
│ email       │       │ subjectType     │──────►│ type        │
│ regionId    │───┐   │ objectId        │       │ jurisdiction│
│ verification│   │   │ objectType      │   ┌──►│ ownershipStr│
│ votingPower │   │   │ involvementType │   │   │ regionIds   │
│ reputation  │   │   │ startDate       │   │   └─────────────┘
│ publicKey   │   │   │ isActive        │   │
└─────────────┘   │   │ significance    │   │   ┌─────────────┐
      │           │   │ financialValue  │   │   │    Bill     │
      │           │   └─────────────────┘   │   ├─────────────┤
      │           │           │             │   │ id          │
      ▼           │           ▼             │   │ title       │
┌─────────────┐   │   ┌─────────────────┐   │   │ content     │
│ Delegation  │   │   │InvolvementRecord│   │   │ version     │
├─────────────┤   │   ├─────────────────┤   │   │ status      │
│ delegatorId │───┘   │ id              │   │   │ sponsorId   │──┐
│ delegateId  │───┐   │ associationId   │   │   │ categoryId  │  │
│ scope       │   │   │ action          │   │   │ regionId    │  │
│ category    │   │   │ actionDate      │   │   │ sunsetDate  │  │
│ expiresAt   │   │   │ details         │   │   │ gitBranch   │  │
└─────────────┘   │   │ documentIds     │   │   └─────────────┘  │
                  │   └─────────────────┘   │         │          │
                  │                         │         ▼          │
                  │   ┌─────────────────┐   │   ┌─────────────┐  │
                  │   │     Region      │   │   │  Amendment  │  │
                  │   ├─────────────────┤   │   ├─────────────┤  │
                  └──►│ id              │◄──┘   │ id          │  │
                      │ name            │       │ billId      │◄─┘
                      │ level           │       │ proposedBy  │
                      │ parentRegionId  │       │ description │
                      │ coordinates     │       │ diff        │
                      └─────────────────┘       │ status      │
                                               └─────────────┘

┌─────────────────┐       ┌─────────────────┐
│  VotingSession  │       │      Vote       │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ billId          │◄──────┤ sessionId       │
│ startDate       │       │ citizenId       │───► Person
│ endDate         │       │ choice          │
│ minParticipation│       │ weight          │
│ approvalThreshold│      │ timestamp       │
│ status          │       │ cryptoProof     │
│ forCount        │       │ delegationChain │
│ againstCount    │       │ isPublic        │
└─────────────────┘       └─────────────────┘

┌─────────────────┐
│  ChangeRecord   │
├─────────────────┤
│ changeId        │
│ commitHash      │
│ parentCommitHash│
│ entityType      │
│ entityId        │
│ changeType      │
│ fieldChanges    │
│ changedBy       │───► Person (author)
│ timestamp       │
│ reason          │
│ signature       │
└─────────────────┘
```

---

## Type Hierarchies

### Verification Levels

```
NONE
  └─ EMAIL_VERIFIED
       └─ PHONE_VERIFIED
            └─ DOCUMENT_VERIFIED
                 └─ FULL_KYC
                      └─ GOVERNMENT_VERIFIED
```

### Governance Levels

```
IMMUTABLE (cannot be changed)
  └─ FEDERAL (national)
       └─ REGIONAL (state)
            └─ LOCAL (municipal)
```

### Bill Status Flow

```
DRAFT → IN_COMMITTEE → SCHEDULED → VOTING
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
                 PASSED           REJECTED          VETOED
                    │                                 │
                    ▼                                 ▼
                 ACTIVE ─────────────────────────► REPEALED
                    │
                    ▼
                 EXPIRED (sunset)
```

### Involvement Types

```
Legislative
├── BILL_SPONSOR
├── BILL_COSPONSOR
├── BILL_VOTER_FOR
├── BILL_VOTER_AGAINST
├── BILL_VOTER_ABSTAIN
├── AMENDMENT_PROPOSER
├── COMMITTEE_MEMBER
└── COMMITTEE_CHAIR

Executive
├── EXECUTIVE_ORDER_SIGNER
├── REGULATION_AUTHOR
├── APPOINTED_OFFICIAL
└── ELECTED_EXECUTIVE

Judicial
├── CASE_JUDGE
├── CASE_PROSECUTOR
├── CASE_DEFENDANT
├── OPINION_AUTHOR
└── OPINION_DISSENTER

Financial
├── CAMPAIGN_DONOR
├── LOBBYIST
├── CONTRACT_RECIPIENT
└── GRANT_RECIPIENT

Organizational
├── OWNER
├── BOARD_MEMBER
├── EXECUTIVE
├── EMPLOYEE
└── INVESTOR
```

---

## Metrics Data Model

### Triple Bottom Line Structure

```
TripleBottomLineScore
├── people: number (0-100)
├── planet: number (0-100)
├── profit: number (0-100)
├── composite: number (weighted)
├── timestamp: Date
└── tradeoffs: Tradeoff[]

Metric
├── id: string
├── name: string
├── category: PEOPLE | PLANET | PROFIT
├── description: string
├── unit: string
├── currentValue: number
├── targetValue: number
└── historicalData: DataPoint[]
```

---

## Audit Trail Data Model

Every entity change is recorded:

```
ChangeRecord
├── changeId: UUID
├── commitHash: string (git-style)
├── parentCommitHash: string
├── entityType: EntityType
├── entityId: string
├── changeType: CREATE | UPDATE | DELETE | ...
├── fieldChanges: FieldChange[]
│   ├── fieldPath: string
│   ├── previousValue: any
│   ├── newValue: any
│   └── changeReason: string
├── changedBy: ChangeAuthor
│   ├── personId: string
│   ├── personName: string
│   ├── role: string
│   └── officialCapacity: boolean
├── timestamp: Date
├── reason: string
├── legalBasis: string (optional)
├── relatedDocuments: string[]
├── signature: string
├── witnesses: string[]
└── verificationStatus: PENDING | VERIFIED | DISPUTED
```

---

## Database Indexes

### Essential Indexes

```sql
-- Person lookups
CREATE INDEX idx_person_email ON persons(email);
CREATE INDEX idx_person_region ON persons(primary_region_id);
CREATE INDEX idx_person_verification ON persons(verification_level);

-- Bill queries
CREATE INDEX idx_bill_status ON bills(status);
CREATE INDEX idx_bill_category ON bills(category_id);
CREATE INDEX idx_bill_region ON bills(region_id);
CREATE INDEX idx_bill_sponsor ON bills(sponsor_id);

-- Association lookups
CREATE INDEX idx_assoc_subject ON associations(subject_id, subject_type);
CREATE INDEX idx_assoc_object ON associations(object_id, object_type);
CREATE INDEX idx_assoc_involvement ON associations(involvement_type);

-- Change history
CREATE INDEX idx_change_entity ON change_records(entity_type, entity_id);
CREATE INDEX idx_change_author ON change_records(changed_by_person_id);
CREATE INDEX idx_change_timestamp ON change_records(timestamp);

-- Vote lookups
CREATE INDEX idx_vote_session ON votes(session_id);
CREATE INDEX idx_vote_citizen ON votes(citizen_id);
```

---

## Data Validation Rules

### Person
- Email must be unique and valid format
- Legal name required, min 2 characters
- Region ID must exist
- Verification level progression only (can't skip levels)

### Bill
- Title required, 5-200 characters
- Content required, non-empty
- Sunset date required and must be future
- Sponsor must be verified citizen

### Vote
- One vote per citizen per session
- Session must be ACTIVE status
- Citizen must be eligible for region

### Delegation
- Cannot delegate to self
- Cannot create circular delegation
- Delegator and delegate must exist
- Cannot duplicate exact delegation

---

## See Also

- [API Documentation](/docs/api/README.md) - For type definitions
- [Entity Registry API](/docs/api/entity-registry.md) - For detailed entity tracking
- [Application Designs](/docs/applications/README.md) - For UI data requirements
