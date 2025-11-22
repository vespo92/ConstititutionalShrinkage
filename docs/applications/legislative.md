# Legislative Application Design

> Git-style bill management, voting, and legislative tracking.

## Overview

The Legislative application is the heart of the git-style democracy system. It enables:
- Bill creation with version control
- Peer review and amendments
- Transparent voting
- Constitutional compliance checking
- Impact prediction display

## User Roles

| Role | Permissions |
|------|-------------|
| Citizen | View bills, vote (if eligible), comment, delegate |
| Verified Citizen | Above + propose amendments |
| Delegate | Above + enhanced voting weight from delegations |
| Sponsor | Above + create bills, manage co-sponsors |
| Committee Member | Above + prioritize bills, schedule votes |
| Admin | Full system access |

## Core Features

### 1. Bill Browser

**Purpose:** Discover and explore legislation

**Views:**
- **Timeline** - Chronological list of recent activity
- **Categories** - Bills organized by topic
- **Status** - Filter by draft, voting, passed, rejected
- **My Region** - Bills relevant to user's region

**Components:**
```
BillBrowser/
├── BillList.tsx           # List of bill cards
├── BillCard.tsx           # Summary card for a bill
├── BillFilters.tsx        # Filter sidebar
├── BillSearch.tsx         # Search input
├── BillSort.tsx           # Sort options
└── CategoryNav.tsx        # Category navigation
```

**API Endpoints:**
```
GET  /api/bills                    # List bills with filters
GET  /api/bills/trending           # Trending bills
GET  /api/bills/my-region/:region  # Region-specific bills
GET  /api/bills/categories         # List categories
```

---

### 2. Bill Detail View

**Purpose:** Full information about a single bill

**Sections:**
- **Header** - Title, status badge, sponsor info
- **Content** - Full bill text with markdown rendering
- **Impact** - Triple Bottom Line predictions
- **Constitutional Check** - Compliance status
- **History** - Git-style version history
- **Discussion** - Comments and debate
- **Voting** - Current results (if active)

**Components:**
```
BillDetail/
├── BillHeader.tsx         # Title, status, actions
├── BillContent.tsx        # Markdown renderer
├── BillImpact.tsx         # TBL impact cards
├── BillConstitutional.tsx # Compliance checker display
├── BillHistory.tsx        # Version timeline
├── BillDiscussion.tsx     # Comment thread
├── BillVoting.tsx         # Vote interface
├── BillAmendments.tsx     # Amendment list
└── BillRelated.tsx        # Related bills
```

**API Endpoints:**
```
GET  /api/bills/:id                    # Get bill details
GET  /api/bills/:id/history            # Get version history
GET  /api/bills/:id/amendments         # Get amendments
GET  /api/bills/:id/comments           # Get comments
GET  /api/bills/:id/impact             # Get impact prediction
GET  /api/bills/:id/constitutional     # Get compliance check
```

---

### 3. Bill Creation Wizard

**Purpose:** Guide users through creating new legislation

**Steps:**
1. **Basic Info** - Title, category, region
2. **Content** - Bill text editor (markdown)
3. **Impact Assessment** - Predicted effects
4. **Constitutional Review** - Check for conflicts
5. **Co-Sponsors** - Invite co-sponsors
6. **Review & Submit** - Final review

**Components:**
```
BillCreate/
├── CreateWizard.tsx       # Multi-step form container
├── StepBasicInfo.tsx      # Step 1
├── StepContent.tsx        # Step 2 - Bill editor
├── StepImpact.tsx         # Step 3
├── StepConstitutional.tsx # Step 4
├── StepCoSponsors.tsx     # Step 5
├── StepReview.tsx         # Step 6
├── BillEditor.tsx         # Rich text editor
└── ImpactPreview.tsx      # TBL preview
```

**API Endpoints:**
```
POST /api/bills                        # Create bill
POST /api/bills/:id/cosponsors         # Invite co-sponsor
POST /api/bills/:id/validate           # Validate bill
GET  /api/bills/:id/impact-preview     # Preview impact
```

---

### 4. Diff Viewer

**Purpose:** Compare versions and see changes

**Features:**
- Side-by-side comparison
- Inline diff highlighting
- Line-by-line blame
- Version selector

**Components:**
```
DiffViewer/
├── DiffContainer.tsx      # Main diff view
├── DiffSideBySide.tsx     # Side-by-side mode
├── DiffInline.tsx         # Inline mode
├── DiffLine.tsx           # Single line with highlighting
├── BlameAnnotation.tsx    # Author/date annotation
└── VersionSelector.tsx    # Version dropdown
```

**API Endpoints:**
```
GET  /api/bills/:id/diff/:v1/:v2       # Get diff between versions
GET  /api/bills/:id/blame              # Get blame info
```

---

### 5. Voting Interface

**Purpose:** Cast and view votes

**Components:**
```
Voting/
├── VotePanel.tsx          # Main voting UI
├── VoteButton.tsx         # For/Against/Abstain buttons
├── VoteConfirmation.tsx   # Confirm vote modal
├── VoteResults.tsx        # Results display
├── QuorumProgress.tsx     # Quorum progress bar
├── DelegationInfo.tsx     # Show delegation status
└── VoteReceipt.tsx        # Cryptographic receipt
```

**States:**
- **Not Eligible** - User cannot vote (wrong region, etc.)
- **Can Vote** - Voting button enabled
- **Already Voted** - Show user's vote
- **Delegated** - Show delegation info
- **Session Closed** - Show final results

**API Endpoints:**
```
POST /api/bills/:id/vote               # Cast vote
GET  /api/bills/:id/my-vote            # Get user's vote
GET  /api/bills/:id/results            # Get current results
GET  /api/bills/:id/session            # Get session info
```

---

### 6. Amendment System

**Purpose:** Propose and vote on changes to bills

**Workflow:**
1. User proposes amendment with diff
2. Amendment enters review period
3. Separate vote on amendment
4. If passed, amendment merges into bill

**Components:**
```
Amendments/
├── AmendmentList.tsx      # List of amendments
├── AmendmentCard.tsx      # Amendment summary
├── AmendmentDetail.tsx    # Full amendment view
├── ProposeAmendment.tsx   # Amendment creation form
├── AmendmentDiff.tsx      # Changes preview
└── AmendmentVote.tsx      # Vote on amendment
```

**API Endpoints:**
```
POST /api/bills/:id/amendments         # Propose amendment
GET  /api/bills/:id/amendments/:aid    # Get amendment
POST /api/amendments/:aid/vote         # Vote on amendment
POST /api/amendments/:aid/merge        # Merge if passed
```

---

## Page Structure

```
apps/legislative/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/dashboard
│   ├── bills/
│   │   ├── page.tsx               # Bill browser
│   │   ├── [id]/
│   │   │   ├── page.tsx           # Bill detail
│   │   │   ├── history/page.tsx   # Version history
│   │   │   ├── vote/page.tsx      # Voting page
│   │   │   └── amend/page.tsx     # Propose amendment
│   │   └── create/page.tsx        # Create bill wizard
│   ├── compare/
│   │   └── [id]/page.tsx          # Diff viewer
│   ├── committees/
│   │   ├── page.tsx               # Committee list
│   │   └── [id]/page.tsx          # Committee detail
│   └── search/page.tsx            # Search results
├── components/                     # App-specific components
├── lib/
│   ├── api.ts                     # API client
│   ├── hooks/                     # Custom hooks
│   └── utils/                     # Utilities
└── styles/                        # App-specific styles
```

## Data Models

### Bill (Database Schema)

```prisma
model Bill {
  id              String      @id @default(uuid())
  title           String
  content         String      @db.Text
  contentHtml     String      @db.Text
  version         String      @default("1.0.0")
  level           Level
  regionId        String?
  status          BillStatus
  sunsetDate      DateTime
  gitBranch       String
  gitCommitHash   String?
  parentBillId    String?

  sponsorId       String
  sponsor         User        @relation("sponsor", fields: [sponsorId], references: [id])
  coSponsors      User[]      @relation("coSponsors")

  categoryId      String
  category        Category    @relation(fields: [categoryId], references: [id])

  amendments      Amendment[]
  votes           Vote[]
  comments        Comment[]

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([status])
  @@index([categoryId])
  @@index([regionId])
}

enum BillStatus {
  DRAFT
  IN_COMMITTEE
  SCHEDULED
  VOTING
  PASSED
  REJECTED
  VETOED
  ACTIVE
  REPEALED
  EXPIRED
}
```

### VotingSession

```prisma
model VotingSession {
  id                  String      @id @default(uuid())
  billId              String      @unique
  bill                Bill        @relation(fields: [billId], references: [id])

  startDate           DateTime
  endDate             DateTime
  status              SessionStatus

  minimumParticipation Float
  approvalThreshold    Float

  forCount            Int         @default(0)
  againstCount        Int         @default(0)
  abstainCount        Int         @default(0)
  weightedFor         Float       @default(0)
  weightedAgainst     Float       @default(0)

  votes               Vote[]

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
}
```

## UI Wireframes

### Bill Card (List View)

```
┌─────────────────────────────────────────────────────────┐
│  [STATUS: VOTING]                           Region: CA  │
│                                                         │
│  Clean Energy Investment Act                            │
│  ─────────────────────────────────────────────────────  │
│  Promotes renewable energy through tax incentives...    │
│                                                         │
│  👤 Sen. Jane Smith  │  📅 Jan 15, 2025  │  💬 42       │
│                                                         │
│  [People: 72] [Planet: 85] [Profit: 68]   🕐 3d left   │
│                                                         │
│  FOR ██████████████░░░░░░ 68%  │  [View] [Vote]        │
└─────────────────────────────────────────────────────────┘
```

### Vote Panel

```
┌─────────────────────────────────────────────────────────┐
│                    CAST YOUR VOTE                       │
│                                                         │
│  Clean Energy Investment Act                            │
│                                                         │
│  Your voting power: 1.0                                 │
│  (You have 3 delegations)                               │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │   FOR   │  │ AGAINST │  │ ABSTAIN │                 │
│  │   ✓     │  │         │  │         │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
│  ☐ Make my vote public                                  │
│                                                         │
│  [Cancel]                    [Confirm Vote]             │
└─────────────────────────────────────────────────────────┘
```

## Integration with Packages

```typescript
// Using shared packages
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
import { votingSystem } from '@constitutional-shrinkage/voting-system';
import { createBill, forkBill } from '@constitutional-shrinkage/governance-utils';
import { metricsSystem } from '@constitutional-shrinkage/metrics';
import { entityRegistry } from '@constitutional-shrinkage/entity-registry';

// Example: Create bill with validation
async function createNewBill(data: BillInput, userId: string) {
  // Create bill using governance-utils
  const bill = createBill({
    title: data.title,
    content: data.content,
    sponsor: userId,
    level: data.level,
    sunsetYears: data.sunsetYears,
  });

  // Validate against constitution
  const validation = constitutionalFramework.validateLaw(bill);
  if (!validation.valid) {
    throw new Error(validation.errors[0].message);
  }

  // Predict impact using metrics
  const impact = metricsSystem.predictImpact(data.content, data.regionId);

  // Record in entity registry
  entityRegistry.createAssociation({
    associationType: 'PERSON_TO_DOCUMENT',
    subjectType: 'PERSON',
    subjectId: userId,
    objectType: 'BILL',
    objectId: bill.id,
    involvementType: 'BILL_SPONSOR',
    // ...
  }, author);

  // Save to database
  return await prisma.bill.create({ data: bill });
}
```

## Implementation Checklist

### Phase 1: Core Viewing
- [ ] Bill list page with filters
- [ ] Bill detail page
- [ ] Category navigation
- [ ] Search functionality
- [ ] Responsive design

### Phase 2: Bill Creation
- [ ] Create bill wizard
- [ ] Markdown editor
- [ ] Constitutional validation display
- [ ] Impact prediction display
- [ ] Co-sponsor invitation

### Phase 3: Voting
- [ ] Vote casting UI
- [ ] Results display
- [ ] Quorum tracking
- [ ] Vote receipts
- [ ] Delegation awareness

### Phase 4: Git Features
- [ ] Version history
- [ ] Diff viewer
- [ ] Blame view
- [ ] Fork functionality
- [ ] Amendment system

### Phase 5: Advanced
- [ ] Real-time updates
- [ ] Notifications
- [ ] Export/Print
- [ ] API for integrations
- [ ] Analytics dashboard
