# Agent_P: Real-Time Collaboration Platform

## Mission
Build comprehensive real-time collaboration infrastructure including collaborative document editing, live co-drafting of legislation, real-time amendments, presence awareness, commenting systems, version control for legal documents, and multi-user session management.

## Branch
```
claude/agent-P-realtime-collaboration-{session-id}
```

## Priority: HIGH

## Context
Modern legislation requires collaborative drafting:
- Multiple authors working simultaneously
- Real-time amendments during debates
- Track changes and version history
- Committee markup sessions
- Public collaborative input periods
- Legal document versioning standards
- Conflict-free concurrent editing

## Target Directories
```
services/collaboration-service/
packages/collaborative-editing/
apps/drafting-studio/
infrastructure/realtime/
```

## Dependencies
- Agent_6: API Gateway (WebSocket support)
- Agent_7: Auth Service (session management)
- Agent_L: Audit (change tracking)

## Your Deliverables

### 1. Collaboration Service

```
services/collaboration-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── documents.ts           # Document management
│   │   ├── sessions.ts            # Collaboration sessions
│   │   ├── comments.ts            # Comment threads
│   │   └── history.ts             # Version history
│   ├── services/
│   │   ├── document/
│   │   │   ├── document-manager.ts
│   │   │   ├── version-control.ts
│   │   │   ├── diff-engine.ts
│   │   │   └── export.ts
│   │   ├── realtime/
│   │   │   ├── crdt-engine.ts
│   │   │   ├── sync-server.ts
│   │   │   ├── presence.ts
│   │   │   └── cursor-sync.ts
│   │   ├── sessions/
│   │   │   ├── session-manager.ts
│   │   │   ├── permissions.ts
│   │   │   └── locking.ts
│   │   └── comments/
│   │       ├── thread-manager.ts
│   │       ├── resolution.ts
│   │       └── suggestions.ts
│   ├── websocket/
│   │   ├── ws-server.ts
│   │   ├── handlers.ts
│   │   └── protocol.ts
│   ├── lib/
│   │   ├── y-protocol.ts          # Yjs protocol
│   │   └── automerge.ts           # Automerge alternative
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Collaborative Editing Package

```
packages/collaborative-editing/
├── src/
│   ├── crdt/
│   │   ├── yjs-provider.ts        # Yjs integration
│   │   ├── automerge-provider.ts  # Automerge alternative
│   │   ├── awareness.ts           # Presence protocol
│   │   └── persistence.ts         # State persistence
│   ├── editor/
│   │   ├── collaborative-editor.tsx
│   │   ├── toolbar.tsx
│   │   ├── formatting.ts
│   │   ├── mentions.ts
│   │   └── legal-styles.ts
│   ├── document/
│   │   ├── legal-document.ts      # Legal document model
│   │   ├── sections.ts            # Section management
│   │   ├── references.ts          # Cross-references
│   │   └── annotations.ts         # Legal annotations
│   ├── diff/
│   │   ├── diff-view.tsx
│   │   ├── track-changes.tsx
│   │   ├── redline.ts
│   │   └── compare.ts
│   ├── comments/
│   │   ├── comment-panel.tsx
│   │   ├── inline-comment.tsx
│   │   ├── suggestion.tsx
│   │   └── resolution.tsx
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Drafting Studio Application

```
apps/drafting-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Studio dashboard
│   │   ├── documents/
│   │   │   ├── page.tsx                # Document list
│   │   │   ├── new/page.tsx            # Create document
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Document view
│   │   │       ├── edit/page.tsx       # Edit mode
│   │   │       ├── history/page.tsx    # Version history
│   │   │       └── compare/page.tsx    # Compare versions
│   │   ├── sessions/
│   │   │   ├── page.tsx                # Active sessions
│   │   │   ├── [id]/page.tsx           # Session view
│   │   │   └── join/[code]/page.tsx    # Join session
│   │   ├── templates/
│   │   │   ├── page.tsx                # Document templates
│   │   │   └── [id]/page.tsx           # Template detail
│   │   └── markup/
│   │       ├── page.tsx                # Markup sessions
│   │       └── [id]/page.tsx           # Markup editor
│   ├── components/
│   │   ├── editor/
│   │   │   ├── CollaborativeEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── FormatMenu.tsx
│   │   │   ├── InsertMenu.tsx
│   │   │   └── LegalFormatting.tsx
│   │   ├── presence/
│   │   │   ├── ActiveUsers.tsx
│   │   │   ├── UserCursor.tsx
│   │   │   ├── UserSelection.tsx
│   │   │   └── PresenceList.tsx
│   │   ├── history/
│   │   │   ├── VersionTimeline.tsx
│   │   │   ├── ChangePreview.tsx
│   │   │   ├── RestoreDialog.tsx
│   │   │   └── DiffViewer.tsx
│   │   ├── comments/
│   │   │   ├── CommentSidebar.tsx
│   │   │   ├── InlineComment.tsx
│   │   │   ├── SuggestionBubble.tsx
│   │   │   └── ThreadView.tsx
│   │   └── document/
│   │       ├── TableOfContents.tsx
│   │       ├── SectionNavigator.tsx
│   │       ├── ReferencePopover.tsx
│   │       └── ExportDialog.tsx
│   ├── hooks/
│   │   ├── useCollaboration.ts
│   │   ├── usePresence.ts
│   │   ├── useComments.ts
│   │   └── useVersionHistory.ts
│   └── lib/
│       └── api.ts
├── package.json
└── tsconfig.json
```

### 4. Real-Time Infrastructure

```
infrastructure/realtime/
├── kubernetes/
│   ├── collaboration-service.yaml
│   ├── websocket-gateway.yaml
│   ├── redis-pubsub.yaml
│   └── hpa-websocket.yaml
├── nginx/
│   ├── websocket-proxy.conf
│   └── sticky-sessions.conf
├── monitoring/
│   ├── websocket-metrics.yaml
│   ├── connection-tracking.yaml
│   └── latency-alerts.yaml
└── scripts/
    ├── connection-test.sh
    └── load-test-ws.sh
```

### 5. CRDT-Based Collaborative Editing

```typescript
// Conflict-free replicated data types for collaboration
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface CollaborativeDocument {
  // Document state
  doc: Y.Doc;
  provider: WebsocketProvider;
  awareness: Awareness;

  // Connection
  connect(roomId: string, userId: string): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;

  // Operations
  getText(): Y.Text;
  getXmlFragment(): Y.XmlFragment;
  applyUpdate(update: Uint8Array): void;

  // Awareness
  setLocalState(state: UserState): void;
  getStates(): Map<number, UserState>;

  // History
  getHistory(): HistoryEntry[];
  undo(): void;
  redo(): void;
}

// User presence state
interface UserState {
  userId: string;
  name: string;
  color: string;
  cursor?: {
    anchor: number;
    head: number;
  };
  selection?: {
    start: number;
    end: number;
  };
  lastActive: Date;
}

// Awareness protocol
interface Awareness {
  setLocalState(state: UserState): void;
  setLocalStateField(field: string, value: unknown): void;
  getLocalState(): UserState;
  getStates(): Map<number, UserState>;
  on(event: 'change' | 'update', handler: Function): void;
  off(event: 'change' | 'update', handler: Function): void;
}

// Document binding for rich text editor
interface EditorBinding {
  // Bind to editor instance
  bind(editor: Editor, type: Y.XmlFragment): void;
  unbind(): void;

  // Cursor sync
  syncCursor(position: Position): void;
  getCursors(): Map<string, CursorPosition>;

  // Selection sync
  syncSelection(selection: Selection): void;
  getSelections(): Map<string, SelectionRange>;
}
```

### 6. Legal Document Model

```typescript
// Structured legal document
interface LegalDocument {
  id: string;
  type: DocumentType;
  title: string;
  shortTitle?: string;
  number?: string;
  version: number;
  status: DocumentStatus;

  // Structure
  preamble?: Preamble;
  enactingClause?: string;
  sections: Section[];
  schedules?: Schedule[];

  // Metadata
  sponsors: Sponsor[];
  committees: Committee[];
  subjects: string[];
  citations: Citation[];

  // History
  introducedDate: Date;
  lastModified: Date;
  history: DocumentHistory[];

  // Collaboration
  collaborators: Collaborator[];
  permissions: DocumentPermissions;
}

type DocumentType =
  | 'bill'
  | 'resolution'
  | 'amendment'
  | 'ordinance'
  | 'regulation'
  | 'report'
  | 'memo';

type DocumentStatus =
  | 'draft'
  | 'review'
  | 'committee'
  | 'floor'
  | 'enacted'
  | 'vetoed'
  | 'archived';

// Document section structure
interface Section {
  id: string;
  number: string;
  title: string;
  content: Y.XmlFragment;         // CRDT content
  subsections: Subsection[];
  annotations: Annotation[];
  effectiveDate?: Date;
  sunsetDate?: Date;
}

interface Subsection {
  id: string;
  designation: string;            // (a), (b), (1), (2), etc.
  content: Y.XmlFragment;
  paragraphs: Paragraph[];
}

// Legal formatting elements
interface LegalFormatting {
  // Standard elements
  definition: (term: string, definition: string) => Node;
  crossReference: (target: string, text: string) => Node;
  amendmentMark: (type: 'insert' | 'delete', content: string) => Node;
  footnote: (content: string) => Node;

  // Section references
  internalRef: (sectionId: string) => Node;
  externalRef: (citation: Citation) => Node;

  // Tracked changes
  insertion: (content: string, author: string, date: Date) => Node;
  deletion: (content: string, author: string, date: Date) => Node;
  substitution: (old: string, new_: string, author: string, date: Date) => Node;
}
```

### 7. Version Control System

```typescript
// Git-like version control for legal documents
interface DocumentVersionControl {
  // Commits
  commit(params: {
    documentId: string;
    message: string;
    author: string;
  }): Promise<Commit>;

  // Branches
  createBranch(documentId: string, branchName: string): Promise<Branch>;
  mergeBranch(source: string, target: string): Promise<MergeResult>;
  deleteBranch(documentId: string, branchName: string): Promise<void>;

  // History
  getHistory(documentId: string, params?: HistoryParams): Promise<Commit[]>;
  getCommit(commitId: string): Promise<CommitDetail>;
  getDiff(fromCommit: string, toCommit: string): Promise<Diff>;

  // Restore
  restore(documentId: string, commitId: string): Promise<void>;
  cherryPick(commitId: string, targetBranch: string): Promise<Commit>;

  // Tags
  tag(commitId: string, tagName: string): Promise<Tag>;
  getTags(documentId: string): Promise<Tag[]>;
}

interface Commit {
  id: string;
  documentId: string;
  branch: string;
  parentId: string | null;
  message: string;
  author: Author;
  timestamp: Date;
  snapshot: Uint8Array;           // CRDT state vector
  changes: Change[];
}

interface Diff {
  fromCommit: string;
  toCommit: string;
  changes: DiffChange[];
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

interface DiffChange {
  type: 'add' | 'delete' | 'modify';
  path: string;                   // Section path
  content: {
    before?: string;
    after?: string;
  };
  author?: string;
}

// Legal-specific versioning
interface LegalVersioning {
  // Official versions
  markAsOfficial(commitId: string): Promise<OfficialVersion>;

  // Engrossed/enrolled versions
  createEngrossedVersion(documentId: string): Promise<EngrossedVersion>;
  createEnrolledVersion(documentId: string): Promise<EnrolledVersion>;

  // Amendment tracking
  trackAmendment(params: {
    baseDocumentId: string;
    amendmentId: string;
    changes: AmendmentChange[];
  }): Promise<void>;

  // Compare versions
  compareVersions(version1: string, version2: string): Promise<LegalDiff>;
}
```

### 8. Comment and Suggestion System

```typescript
// Collaborative commenting
interface CommentSystem {
  // Create comments
  createComment(params: {
    documentId: string;
    anchor: TextAnchor;
    content: string;
    type: CommentType;
  }): Promise<Comment>;

  // Thread management
  replyToComment(commentId: string, content: string): Promise<Comment>;
  resolveThread(threadId: string): Promise<void>;
  reopenThread(threadId: string): Promise<void>;

  // Suggestions
  createSuggestion(params: {
    documentId: string;
    range: TextRange;
    suggestion: string;
    rationale?: string;
  }): Promise<Suggestion>;

  acceptSuggestion(suggestionId: string): Promise<void>;
  rejectSuggestion(suggestionId: string, reason?: string): Promise<void>;

  // Queries
  getComments(documentId: string, filter?: CommentFilter): Promise<Comment[]>;
  getThreads(documentId: string): Promise<CommentThread[]>;
}

type CommentType =
  | 'comment'
  | 'suggestion'
  | 'question'
  | 'legal_note'
  | 'formatting';

interface Comment {
  id: string;
  threadId: string;
  documentId: string;
  anchor: TextAnchor;
  content: string;
  type: CommentType;
  author: Author;
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  resolvedBy?: Author;
  resolvedAt?: Date;
  reactions: Reaction[];
}

interface Suggestion extends Comment {
  type: 'suggestion';
  originalText: string;
  suggestedText: string;
  rationale?: string;
  status: 'pending' | 'accepted' | 'rejected';
  acceptedBy?: Author;
  acceptedAt?: Date;
  rejectedReason?: string;
}

// Text anchoring for comments
interface TextAnchor {
  type: 'point' | 'range';
  sectionId: string;
  start: {
    paragraph: number;
    offset: number;
  };
  end?: {
    paragraph: number;
    offset: number;
  };
  quote: string;                  // Quoted text for resilience
}
```

### 9. Collaboration Sessions

```typescript
// Multi-user collaboration sessions
interface SessionManager {
  // Session lifecycle
  createSession(params: {
    documentId: string;
    type: SessionType;
    host: string;
    settings: SessionSettings;
  }): Promise<Session>;

  joinSession(sessionId: string, userId: string): Promise<SessionToken>;
  leaveSession(sessionId: string, userId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;

  // Permissions
  setParticipantRole(
    sessionId: string,
    userId: string,
    role: ParticipantRole
  ): Promise<void>;

  // Controls
  lockDocument(sessionId: string): Promise<void>;
  unlockDocument(sessionId: string): Promise<void>;
  lockSection(sessionId: string, sectionId: string): Promise<void>;

  // Broadcasting
  broadcast(sessionId: string, message: SessionMessage): Promise<void>;
}

type SessionType =
  | 'drafting'           // Initial document drafting
  | 'review'             // Document review
  | 'markup'             // Committee markup
  | 'amendment'          // Amendment session
  | 'public_input';      // Public collaboration

type ParticipantRole =
  | 'host'               // Full control
  | 'editor'             // Can edit
  | 'commenter'          // Comment only
  | 'viewer';            // View only

interface Session {
  id: string;
  documentId: string;
  type: SessionType;
  status: 'active' | 'paused' | 'ended';
  host: Participant;
  participants: Participant[];
  settings: SessionSettings;
  startedAt: Date;
  endedAt?: Date;
  recording?: SessionRecording;
}

interface SessionSettings {
  maxParticipants: number;
  allowComments: boolean;
  allowSuggestions: boolean;
  requireApproval: boolean;
  autoSave: boolean;
  saveInterval: number;
  lockOnConflict: boolean;
}

interface Participant {
  userId: string;
  name: string;
  role: ParticipantRole;
  color: string;
  joinedAt: Date;
  lastActive: Date;
  cursor?: CursorPosition;
  selection?: SelectionRange;
}
```

## API Endpoints

```yaml
Documents:
  GET    /collaboration/documents           # List documents
  POST   /collaboration/documents           # Create document
  GET    /collaboration/documents/:id       # Get document
  PUT    /collaboration/documents/:id       # Update document
  DELETE /collaboration/documents/:id       # Delete document

Sessions:
  GET    /collaboration/sessions            # List sessions
  POST   /collaboration/sessions            # Create session
  GET    /collaboration/sessions/:id        # Get session
  POST   /collaboration/sessions/:id/join   # Join session
  POST   /collaboration/sessions/:id/leave  # Leave session
  DELETE /collaboration/sessions/:id        # End session

Version Control:
  GET    /collaboration/documents/:id/history  # Get history
  POST   /collaboration/documents/:id/commit   # Create commit
  GET    /collaboration/documents/:id/diff     # Get diff
  POST   /collaboration/documents/:id/restore  # Restore version

Comments:
  GET    /collaboration/documents/:id/comments  # Get comments
  POST   /collaboration/documents/:id/comments  # Add comment
  PUT    /collaboration/comments/:id           # Update comment
  POST   /collaboration/comments/:id/resolve   # Resolve thread

WebSocket:
  WS     /collaboration/ws/:sessionId          # Real-time connection
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Real-time Latency | <100ms |
| Concurrent Users | 100+ per document |
| Sync Reliability | 99.99% |
| Version Storage | Unlimited |
| Comment Threads | 1000+ per document |

## Success Criteria

1. [ ] CRDT engine operational
2. [ ] Real-time sync working
3. [ ] Presence awareness functional
4. [ ] Cursor/selection sync working
5. [ ] Version control operational
6. [ ] Diff generation working
7. [ ] Comment system functional
8. [ ] Suggestion workflow complete
9. [ ] Session management working
10. [ ] Permission system enforced
11. [ ] Legal formatting implemented
12. [ ] Export to standard formats

## Handoff Notes

For downstream agents:
- Collaboration API available for legislative features
- CRDT package exported for other real-time features
- Version control integrates with Agent_L (Audit)
- Legal document model shared with Agent_C (AI Services)

---

*Agent_P Assignment - Real-Time Collaboration Platform*
