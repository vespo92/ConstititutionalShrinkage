# Agent_10: Judicial Application

## Mission
Build the Judicial application in `apps/judicial/` - a platform for constitutional review, bill compliance checking, dispute resolution, and maintaining the integrity of the legislative process.

## Branch
```
claude/agent-10-judicial-app-{session-id}
```

## Priority: HIGH

## Context
You are building a Next.js 14 frontend that will:
- Consume the API Gateway (Agent_6)
- Use the Auth Service (Agent_7) for authentication
- Heavily integrate with `packages/constitutional-framework`
- Provide tools for judicial review and compliance

## Target Directory
```
apps/judicial/
```

## Your Deliverables

### 1. Pages to Implement

#### Dashboard (/)
- Overview of pending reviews
- Constitutional compliance statistics
- Recent cases and rulings
- System health indicators
- Priority queue of bills needing review

#### Constitutional Review (/review)
- Bills pending constitutional review
- Review assignment and workflow
- Priority and urgency indicators
- Batch review capabilities

#### Review Detail (/review/[billId])
- Full bill text display
- Constitutional compliance analysis
- Rights impact assessment
- Historical precedent lookup
- Reviewer notes and annotations
- Ruling input form
- Publish ruling workflow

#### Compliance Dashboard (/compliance)
- Overall compliance metrics
- Violations by category
- Trend analysis
- Compliance score by region
- Automated check results

#### Compliance Check (/compliance/check)
- Manual compliance check tool
- Upload bill text for analysis
- Detailed violation reports
- Remediation suggestions
- Export compliance report

#### Cases (/cases)
- List of all cases/disputes
- Filter by status, type, region
- Search functionality
- Case assignment

#### Case Detail (/cases/[id])
- Full case information
- Parties involved
- Evidence and documents
- Timeline of events
- Hearing schedule
- Ruling and resolution

#### New Case (/cases/new)
- File new case/dispute
- Form for case details
- Upload supporting documents
- Party identification

#### Conflicts (/conflicts)
- Active legislative conflicts
- Conflict between laws
- Contradictory provisions
- Resolution workflow

#### Conflict Resolution (/conflicts/resolve)
- Conflict analysis tool
- Side-by-side comparison
- Resolution options
- Resolution drafting

#### Audit Trail (/audit)
- Full audit trail viewer
- Filter by entity, action, date
- Detailed change logs
- Integrity verification

#### Precedents (/precedents)
- Precedent search
- Historical rulings database
- Categorized by topic
- Citation tracker

### 2. File Structure

```
apps/judicial/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Judicial dashboard
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── review/
│   │   │   ├── page.tsx            # Pending reviews list
│   │   │   ├── [billId]/
│   │   │   │   ├── page.tsx        # Review interface
│   │   │   │   └── ruling/page.tsx # Issue ruling
│   │   │   └── history/page.tsx    # Past reviews
│   │   ├── compliance/
│   │   │   ├── page.tsx            # Compliance overview
│   │   │   ├── check/page.tsx      # Manual check tool
│   │   │   ├── violations/page.tsx # Violation list
│   │   │   └── reports/page.tsx    # Compliance reports
│   │   ├── cases/
│   │   │   ├── page.tsx            # Case list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Case detail
│   │   │   │   ├── evidence/page.tsx
│   │   │   │   └── ruling/page.tsx
│   │   │   └── new/page.tsx        # File new case
│   │   ├── conflicts/
│   │   │   ├── page.tsx            # Conflict list
│   │   │   ├── [id]/page.tsx       # Conflict detail
│   │   │   └── resolve/page.tsx    # Resolution tool
│   │   ├── audit/
│   │   │   └── page.tsx            # Audit trail viewer
│   │   ├── precedents/
│   │   │   ├── page.tsx            # Precedent search
│   │   │   └── [id]/page.tsx       # Precedent detail
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── review/
│   │   │   ├── ReviewQueue.tsx
│   │   │   ├── BillViewer.tsx
│   │   │   ├── CompliancePanel.tsx
│   │   │   ├── RightsImpact.tsx
│   │   │   ├── AnnotationTool.tsx
│   │   │   └── RulingForm.tsx
│   │   ├── compliance/
│   │   │   ├── ComplianceChecker.tsx
│   │   │   ├── ViolationCard.tsx
│   │   │   ├── ComplianceScore.tsx
│   │   │   └── RemediationSuggestion.tsx
│   │   ├── cases/
│   │   │   ├── CaseCard.tsx
│   │   │   ├── CaseTimeline.tsx
│   │   │   ├── EvidenceUploader.tsx
│   │   │   ├── PartyInfo.tsx
│   │   │   └── HearingScheduler.tsx
│   │   ├── conflicts/
│   │   │   ├── ConflictCard.tsx
│   │   │   ├── SideBySideCompare.tsx
│   │   │   └── ResolutionDrafter.tsx
│   │   ├── audit/
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── ChangeLogEntry.tsx
│   │   │   └── IntegrityCheck.tsx
│   │   ├── precedents/
│   │   │   ├── PrecedentSearch.tsx
│   │   │   ├── PrecedentCard.tsx
│   │   │   └── CitationList.tsx
│   │   ├── shared/
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── DataTable.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Alert.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── constitutional.ts       # Constitutional check helpers
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useReview.ts
│   │   ├── useCases.ts
│   │   └── useCompliance.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

### 3. Key Features

#### Constitutional Compliance Checker
```typescript
interface ComplianceCheck {
  billId: string;
  overallScore: number; // 0-100
  status: 'compliant' | 'warning' | 'violation';
  violations: Violation[];
  warnings: Warning[];
  checkedRights: RightsCheck[];
}

interface Violation {
  rightId: string;
  rightName: string;
  severity: 'minor' | 'major' | 'critical';
  clause: string;           // Bill text that violates
  explanation: string;      // Why it violates
  remediation?: string;     // How to fix
}

interface RightsCheck {
  rightId: string;
  rightName: string;
  category: 'fundamental' | 'procedural' | 'economic';
  status: 'protected' | 'at_risk' | 'violated';
  impact: number;  // -100 to +100
}
```

#### Case Management
```typescript
interface Case {
  id: string;
  type: 'dispute' | 'review' | 'appeal' | 'interpretation';
  title: string;
  status: 'filed' | 'assigned' | 'hearing' | 'deliberation' | 'ruled';
  parties: Party[];
  filedDate: Date;
  assignedJudge?: string;
  evidence: Evidence[];
  hearings: Hearing[];
  ruling?: Ruling;
}

interface Ruling {
  id: string;
  caseId: string;
  summary: string;
  fullText: string;
  outcome: 'upheld' | 'overturned' | 'modified' | 'dismissed';
  precedentValue: boolean;
  issuedBy: string;
  issuedAt: Date;
  citations: string[];
}
```

#### Integration with Constitutional Framework
```typescript
// Use the constitutional-framework package
import {
  validateBillConstitutionality,
  getAffectedRights,
  checkPrecedents
} from '@constitutional/constitutional-framework';

// In compliance check page
const checkCompliance = async (billText: string) => {
  const result = await validateBillConstitutionality(billText);
  const rights = await getAffectedRights(billText);
  const precedents = await checkPrecedents(billText);

  return { result, rights, precedents };
};
```

### 4. Design Guidelines

- Formal, professional legal aesthetic
- Clear document hierarchy
- High readability for long-form legal text
- Monospace fonts for bill text/legal citations
- Accessibility is critical (legal documents must be accessible)
- Print-friendly layouts for rulings and reports

Color scheme:
- Primary: Deep blue (authority, trust)
- Secondary: Gold (justice, importance)
- Compliance: Green (good), Yellow (warning), Red (violation)

### 5. Access Control

This app is for **judges** and **judicial staff** only:
- Require `judge` or `judicial_staff` role
- Case assignment based on permissions
- Seal sensitive case information appropriately

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 30-35 |
| Lines of Code | 3,000-3,500 |
| Pages | 12-15 |
| Components | 15-20 |

## Success Criteria

1. [ ] All pages rendering correctly
2. [ ] Constitutional compliance checker working
3. [ ] Case management CRUD operations
4. [ ] Diff viewer for bill comparisons
5. [ ] Precedent search functional
6. [ ] Audit trail displaying correctly
7. [ ] Document viewer for legal text
8. [ ] Responsive and accessible design
9. [ ] TypeScript compiles without errors

---

*Agent_10 Assignment - Judicial Application*
