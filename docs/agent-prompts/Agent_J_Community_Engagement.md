# Agent_J: Community Engagement & Social Features

## Mission
Build comprehensive community engagement tools including discussion forums, public comment systems, petition creation, town halls, citizen feedback mechanisms, and social features that foster constructive civic discourse.

## Branch
```
claude/agent-J-community-engagement-{session-id}
```

## Priority: MEDIUM

## Context
Democracy thrives on citizen participation:
- Structured discussions on legislation
- Public comment periods on bills
- Citizen-initiated petitions
- Virtual town halls and Q&A
- Feedback on policy effectiveness
- Community organizing tools
- Constructive debate facilitation

## Target Directories
```
apps/community/
services/community-service/
packages/moderation/
```

## Your Deliverables

### 1. Community Application

```
apps/community/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Community home
│   │   ├── discussions/
│   │   │   ├── page.tsx                # All discussions
│   │   │   ├── [id]/page.tsx           # Discussion thread
│   │   │   ├── new/page.tsx            # Start discussion
│   │   │   └── bill/[billId]/page.tsx  # Bill-specific
│   │   ├── comments/
│   │   │   ├── page.tsx                # Public comment tracker
│   │   │   └── [billId]/page.tsx       # Bill comments
│   │   ├── petitions/
│   │   │   ├── page.tsx                # Browse petitions
│   │   │   ├── [id]/page.tsx           # Petition detail
│   │   │   ├── new/page.tsx            # Create petition
│   │   │   └── my/page.tsx             # My petitions
│   │   ├── townhalls/
│   │   │   ├── page.tsx                # Scheduled town halls
│   │   │   ├── [id]/page.tsx           # Town hall room
│   │   │   ├── live/[id]/page.tsx      # Live event
│   │   │   └── archive/page.tsx        # Past events
│   │   ├── feedback/
│   │   │   ├── page.tsx                # Give feedback
│   │   │   └── policy/[id]/page.tsx    # Policy feedback
│   │   ├── groups/
│   │   │   ├── page.tsx                # Community groups
│   │   │   ├── [id]/page.tsx           # Group page
│   │   │   └── create/page.tsx         # Create group
│   │   └── profile/
│   │       └── [userId]/page.tsx       # Public profile
│   ├── components/
│   │   ├── discussions/
│   │   │   ├── ThreadList.tsx
│   │   │   ├── ThreadView.tsx
│   │   │   ├── CommentTree.tsx
│   │   │   ├── ReplyEditor.tsx
│   │   │   └── VoteButtons.tsx
│   │   ├── comments/
│   │   │   ├── CommentForm.tsx
│   │   │   ├── CommentList.tsx
│   │   │   └── CommentFilter.tsx
│   │   ├── petitions/
│   │   │   ├── PetitionCard.tsx
│   │   │   ├── SignatureProgress.tsx
│   │   │   ├── SignButton.tsx
│   │   │   └── PetitionForm.tsx
│   │   ├── townhalls/
│   │   │   ├── EventCard.tsx
│   │   │   ├── LiveRoom.tsx
│   │   │   ├── QAPanel.tsx
│   │   │   ├── ChatSidebar.tsx
│   │   │   └── HandRaise.tsx
│   │   ├── moderation/
│   │   │   ├── ReportButton.tsx
│   │   │   ├── ModQueue.tsx
│   │   │   └── ContentWarning.tsx
│   │   └── common/
│   │       ├── UserBadge.tsx
│   │       ├── ReputationScore.tsx
│   │       └── ActivityFeed.tsx
│   ├── hooks/
│   │   ├── useDiscussion.ts
│   │   ├── usePetition.ts
│   │   ├── useTownHall.ts
│   │   └── useModeration.ts
│   └── lib/
│       └── api.ts
├── package.json
└── tsconfig.json
```

### 2. Community Service

```
services/community-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── discussions.ts          # Discussion CRUD
│   │   ├── comments.ts             # Public comments
│   │   ├── petitions.ts            # Petition management
│   │   ├── townhalls.ts            # Town hall events
│   │   ├── feedback.ts             # Policy feedback
│   │   ├── groups.ts               # Community groups
│   │   └── moderation.ts           # Moderation actions
│   ├── services/
│   │   ├── discussion/
│   │   │   ├── thread-manager.ts
│   │   │   ├── comment-tree.ts
│   │   │   └── voting.ts
│   │   ├── petition/
│   │   │   ├── signature-collector.ts
│   │   │   ├── threshold-checker.ts
│   │   │   └── notification.ts
│   │   ├── townhall/
│   │   │   ├── room-manager.ts
│   │   │   ├── question-queue.ts
│   │   │   ├── live-chat.ts
│   │   │   └── recording.ts
│   │   ├── moderation/
│   │   │   ├── content-filter.ts
│   │   │   ├── spam-detector.ts
│   │   │   ├── toxicity-scorer.ts
│   │   │   └── queue-manager.ts
│   │   └── reputation/
│   │       ├── score-calculator.ts
│   │       └── badge-awarder.ts
│   ├── lib/
│   │   ├── websocket.ts            # Real-time updates
│   │   └── media.ts                # Media handling
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Moderation Package

```
packages/moderation/
├── src/
│   ├── filters/
│   │   ├── toxicity.ts             # Toxicity detection
│   │   ├── spam.ts                 # Spam detection
│   │   ├── misinformation.ts       # Misinformation flags
│   │   └── pii.ts                  # PII detection
│   ├── actions/
│   │   ├── hide.ts
│   │   ├── warn.ts
│   │   ├── mute.ts
│   │   └── ban.ts
│   ├── queue/
│   │   ├── review-queue.ts
│   │   ├── priority.ts
│   │   └── assignment.ts
│   ├── reports/
│   │   ├── report-handler.ts
│   │   └── escalation.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Discussion System

```typescript
// Threaded discussions on legislation
interface DiscussionSystem {
  // Create discussion thread
  createThread(params: {
    title: string;
    content: string;
    billId?: string;          // Link to legislation
    category: DiscussionCategory;
    tags: string[];
  }): Promise<Thread>;

  // Comment on thread
  addComment(params: {
    threadId: string;
    parentId?: string;        // For nested replies
    content: string;
  }): Promise<Comment>;

  // Vote on comments
  vote(commentId: string, type: 'up' | 'down'): Promise<void>;

  // Sort and filter
  getThreads(params: {
    billId?: string;
    category?: string;
    sort: 'hot' | 'new' | 'top' | 'controversial';
    timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
  }): Promise<PaginatedThreads>;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  author: UserSummary;
  billId?: string;
  category: DiscussionCategory;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  locked: boolean;
}
```

### 5. Public Comment System

```typescript
// Formal public comments on legislation
interface PublicCommentSystem {
  // Submit formal comment
  submitComment(params: {
    billId: string;
    position: 'support' | 'oppose' | 'neutral';
    comment: string;
    attachments?: Attachment[];
    representingOrg?: string;
  }): Promise<PublicComment>;

  // Get comments on bill
  getComments(billId: string, params: {
    position?: 'support' | 'oppose' | 'neutral';
    sort: 'recent' | 'relevance';
    page: number;
  }): Promise<PaginatedComments>;

  // Comment period management
  openCommentPeriod(billId: string, deadline: Date): Promise<void>;
  closeCommentPeriod(billId: string): Promise<CommentSummary>;

  // Export for official record
  exportComments(billId: string, format: 'pdf' | 'csv'): Promise<Buffer>;
}

interface CommentSummary {
  billId: string;
  totalComments: number;
  breakdown: {
    support: number;
    oppose: number;
    neutral: number;
  };
  topConcerns: string[];
  topSupports: string[];
  organizationsRepresented: number;
}
```

### 6. Petition System

```typescript
// Citizen petitions
interface PetitionSystem {
  // Create petition
  create(params: {
    title: string;
    description: string;
    goal: number;                    // Signature goal
    category: PetitionCategory;
    region: string;
    deadline?: Date;
  }): Promise<Petition>;

  // Sign petition
  sign(petitionId: string, params: {
    publicSignature: boolean;        // Show name publicly
    comment?: string;
  }): Promise<Signature>;

  // Check thresholds
  checkThreshold(petitionId: string): Promise<ThresholdStatus>;

  // When threshold reached, trigger action
  onThresholdReached(petitionId: string): Promise<void>;
}

interface Petition {
  id: string;
  title: string;
  description: string;
  creator: UserSummary;
  signatures: number;
  goal: number;
  progress: number;                  // percentage
  category: PetitionCategory;
  region: string;
  status: 'active' | 'successful' | 'closed' | 'rejected';
  createdAt: Date;
  deadline?: Date;
  responseRequired: boolean;         // Official response needed
  officialResponse?: string;
}

// Threshold rules
interface ThresholdRules {
  localAction: 100;                  // Requires local review
  regionalAction: 1000;              // Requires regional response
  stateAction: 10000;                // Goes to state level
  federalAction: 100000;             // Federal consideration
}
```

### 7. Virtual Town Halls

```typescript
// Live town hall events
interface TownHallSystem {
  // Create event
  schedule(params: {
    title: string;
    description: string;
    host: string;                    // Official/representative
    scheduledFor: Date;
    duration: number;                // minutes
    billIds?: string[];              // Related legislation
    region: string;
    maxAttendees?: number;
  }): Promise<TownHall>;

  // Join event
  join(eventId: string): Promise<ParticipantToken>;

  // Q&A management
  submitQuestion(eventId: string, question: string): Promise<Question>;
  upvoteQuestion(questionId: string): Promise<void>;
  answerQuestion(questionId: string, answer: string): Promise<void>;

  // Raise hand to speak
  raiseHand(eventId: string): Promise<void>;
  callOnParticipant(eventId: string, participantId: string): Promise<void>;

  // Recording
  startRecording(eventId: string): Promise<void>;
  endRecording(eventId: string): Promise<Recording>;
}

interface TownHall {
  id: string;
  title: string;
  description: string;
  host: OfficialProfile;
  scheduledFor: Date;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  attendees: number;
  questions: Question[];
  recording?: Recording;
  transcript?: string;
}
```

### 8. Reputation System

```typescript
// Community reputation
interface ReputationSystem {
  // Calculate reputation score
  calculateScore(userId: string): Promise<ReputationScore>;

  // Factors
  factors: {
    votingParticipation: Weight;
    constructiveComments: Weight;
    petitionsCreated: Weight;
    questionsAnswered: Weight;
    reportAccuracy: Weight;          // Accurate reports
    communityStanding: Weight;       // Upvotes received
  };

  // Badges
  awardBadge(userId: string, badge: Badge): Promise<void>;
  checkBadgeEligibility(userId: string): Promise<Badge[]>;

  // Privileges based on reputation
  privileges: {
    upvote: 0;
    downvote: 100;
    comment: 0;
    createThread: 50;
    createPetition: 200;
    moderateBasic: 1000;
    moderateFull: 5000;
  };
}
```

## API Endpoints

```yaml
Discussions:
  GET    /community/discussions           # List threads
  POST   /community/discussions           # Create thread
  GET    /community/discussions/:id       # Get thread
  POST   /community/discussions/:id/comments  # Add comment
  POST   /community/discussions/:id/vote  # Vote

Comments:
  GET    /community/comments/bill/:billId # Get bill comments
  POST   /community/comments              # Submit comment
  GET    /community/comments/summary/:billId  # Get summary

Petitions:
  GET    /community/petitions             # List petitions
  POST   /community/petitions             # Create petition
  GET    /community/petitions/:id         # Get petition
  POST   /community/petitions/:id/sign    # Sign petition

Town Halls:
  GET    /community/townhalls             # List events
  POST   /community/townhalls             # Schedule event
  GET    /community/townhalls/:id         # Get event
  POST   /community/townhalls/:id/question  # Submit question
  WS     /community/townhalls/:id/live    # Live connection

Groups:
  GET    /community/groups                # List groups
  POST   /community/groups                # Create group
  GET    /community/groups/:id            # Get group
  POST   /community/groups/:id/join       # Join group

Moderation:
  POST   /community/reports               # Report content
  GET    /community/moderation/queue      # Mod queue
  POST   /community/moderation/action     # Take action
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| UI Pages | 20-25 |
| API Endpoints | 30-40 |
| Components | 30-40 |
| Lines of Code | 12,000-15,000 |
| Real-time Features | 5+ |

## Success Criteria

1. [ ] Discussion threads working with nested comments
2. [ ] Voting on comments functional
3. [ ] Public comment system operational
4. [ ] Petition creation and signing working
5. [ ] Signature threshold triggers working
6. [ ] Town hall scheduling functional
7. [ ] Live Q&A with upvoting working
8. [ ] Content moderation filtering active
9. [ ] Reputation system calculating scores
10. [ ] Real-time updates via WebSocket
11. [ ] Mobile-responsive design
12. [ ] Accessibility compliant

---

*Agent_J Assignment - Community Engagement & Social Features*
