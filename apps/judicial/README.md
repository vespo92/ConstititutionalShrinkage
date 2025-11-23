# Judicial System

A comprehensive platform for constitutional review, compliance checking, and case management.

## Features

### Constitutional Review
- Review pending bills for constitutional compliance
- Rights impact assessment with visual scoring
- Historical precedent lookup
- Reviewer notes and annotations
- Ruling submission workflow

### Compliance Dashboard
- Overall compliance metrics and analytics
- Violations by category visualization
- Trend analysis over time
- Automated compliance checking tool
- Export compliance reports

### Case Management
- File and track disputes, appeals, and interpretation requests
- Party management with role assignments
- Evidence submission and management
- Case timeline visualization
- Hearing scheduling
- Ruling issuance

### Conflict Resolution
- Detect conflicts between laws
- Side-by-side comparison of conflicting provisions
- Resolution drafting with templates
- Conflict analysis tools

### Audit Trail
- Complete history of all activities
- Filter by entity type, action, and date range
- Export capabilities
- Integrity verification

### Precedent Database
- Search historical rulings and precedents
- Categorized by topic
- Citation tracking
- Full-text search

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React hooks
- **Package Manager**: npm (within Turborepo)

## Project Structure

```
apps/judicial/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── review/             # Constitutional review pages
│   │   ├── compliance/         # Compliance checking pages
│   │   ├── cases/              # Case management pages
│   │   ├── conflicts/          # Conflict resolution pages
│   │   ├── audit/              # Audit trail page
│   │   ├── precedents/         # Precedent search page
│   │   └── settings/           # Settings page
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   ├── review/             # Review-specific components
│   │   ├── compliance/         # Compliance components
│   │   ├── cases/              # Case management components
│   │   ├── conflicts/          # Conflict resolution components
│   │   ├── audit/              # Audit trail components
│   │   └── precedents/         # Precedent search components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Getting Started

```bash
# From the monorepo root
npm install

# Run development server
npm run dev --filter=@constitutional-shrinkage/judicial

# Or from the judicial app directory
cd apps/judicial
npm run dev
```

The app will be available at `http://localhost:3004`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Judicial dashboard with overview stats |
| `/review` | Pending constitutional reviews |
| `/review/[billId]` | Review detail and ruling interface |
| `/review/history` | Past reviews and decisions |
| `/compliance` | Compliance dashboard and analytics |
| `/compliance/check` | Manual compliance check tool |
| `/compliance/violations` | All violations list |
| `/compliance/reports` | Generated compliance reports |
| `/cases` | Case management |
| `/cases/[id]` | Case detail page |
| `/cases/new` | File new case |
| `/conflicts` | Legislative conflicts |
| `/conflicts/resolve` | Conflict resolution tool |
| `/audit` | Full audit trail |
| `/precedents` | Precedent search |
| `/settings` | App settings |

## Design Guidelines

- **Color Scheme**:
  - Primary: Deep blue (#1e3a5f) - authority, trust
  - Secondary: Gold (#d4af37) - justice, importance
  - Compliance: Green/Yellow/Red for status indicators

- **Typography**:
  - Sans-serif for UI elements
  - Monospace for legal citations and bill text
  - Serif (legal) for formal documents

- **Accessibility**: Full WCAG 2.1 AA compliance

## Dependencies

Internal packages:
- `@constitutional-shrinkage/governance-utils`
- `@constitutional-shrinkage/constitutional-framework`
- `@constitutional-shrinkage/entity-registry`

## Impact Goals by 2030

- 100% constitutional compliance rate for new legislation
- Full transparency in judicial decision-making
- Reduced time-to-review for bills
- Comprehensive precedent database
- Automated conflict detection
