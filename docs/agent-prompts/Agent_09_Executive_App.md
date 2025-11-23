# Agent_9: Executive Application

## Mission
Build the Executive application in `apps/executive/` - a dashboard for regional pod administrators to implement policies, allocate resources, and track performance.

## Branch
```
claude/agent-9-executive-app-{session-id}
```

## Priority: HIGH

## Context
You are building a Next.js 14 frontend that will:
- Consume the API Gateway (Agent_6)
- Use the Auth Service (Agent_7) for authentication
- Integrate with `packages/metrics-system` for TBL scoring
- Provide tools for executive/administrative functions

## Target Directory
```
apps/executive/
```

## Your Deliverables

### 1. Pages to Implement

#### Dashboard (/)
- Overview of all active policies
- Key performance indicators (KPIs)
- Recent activity feed
- Quick actions panel
- Alerts and urgent items

#### Policies (/policies)
- List all policies under implementation
- Filter by status, region, category
- Search functionality
- Policy creation workflow
- Implementation progress tracking

#### Policy Detail (/policies/[id])
- Full policy details
- Implementation checklist
- Timeline and milestones
- Resource allocation view
- Impact metrics (TBL scores)
- Related legislation link

#### Resources (/resources)
- Resource overview dashboard
- Budget allocation view
- Personnel assignments
- Infrastructure status
- Resource request queue

#### Resource Allocation (/resources/allocate)
- Allocation wizard
- Budget distribution tool
- Priority setting interface
- Approval workflow

#### Metrics (/metrics)
- Triple Bottom Line dashboard
  - People metrics
  - Planet metrics
  - Profit metrics
- Trend charts over time
- Comparative analysis (vs targets)
- Regional comparisons

#### Reports (/metrics/reports)
- Report generator
- Export to PDF/CSV
- Scheduled reports setup
- Historical report archive

#### Emergency (/emergency)
- Emergency response panel
- Active incidents
- Coordination tools
- Resource mobilization
- Communication hub

### 2. File Structure

```
apps/executive/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with nav
│   │   ├── page.tsx                # Dashboard home
│   │   ├── loading.tsx             # Loading state
│   │   ├── error.tsx               # Error boundary
│   │   ├── policies/
│   │   │   ├── page.tsx            # Policy list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Policy detail
│   │   │   │   └── edit/page.tsx   # Edit policy
│   │   │   ├── create/page.tsx     # Create new policy
│   │   │   └── implement/page.tsx  # Implementation tracker
│   │   ├── resources/
│   │   │   ├── page.tsx            # Resource overview
│   │   │   ├── allocate/page.tsx   # Allocation wizard
│   │   │   ├── budget/page.tsx     # Budget view
│   │   │   └── personnel/page.tsx  # Personnel management
│   │   ├── metrics/
│   │   │   ├── page.tsx            # TBL dashboard
│   │   │   ├── people/page.tsx     # People metrics detail
│   │   │   ├── planet/page.tsx     # Planet metrics detail
│   │   │   ├── profit/page.tsx     # Profit metrics detail
│   │   │   └── reports/page.tsx    # Report generator
│   │   ├── emergency/
│   │   │   ├── page.tsx            # Emergency panel
│   │   │   ├── incidents/page.tsx  # Active incidents
│   │   │   └── coordination/page.tsx
│   │   └── settings/
│   │       └── page.tsx            # App settings
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── AlertsBanner.tsx
│   │   ├── policies/
│   │   │   ├── PolicyCard.tsx
│   │   │   ├── PolicyList.tsx
│   │   │   ├── PolicyForm.tsx
│   │   │   ├── ImplementationTracker.tsx
│   │   │   └── TimelineMilestones.tsx
│   │   ├── resources/
│   │   │   ├── ResourceCard.tsx
│   │   │   ├── BudgetChart.tsx
│   │   │   ├── AllocationWizard.tsx
│   │   │   └── PersonnelTable.tsx
│   │   ├── metrics/
│   │   │   ├── TBLDashboard.tsx
│   │   │   ├── MetricsChart.tsx
│   │   │   ├── TrendGraph.tsx
│   │   │   ├── ComparisonView.tsx
│   │   │   └── ScoreCard.tsx
│   │   ├── emergency/
│   │   │   ├── EmergencyPanel.tsx
│   │   │   ├── IncidentCard.tsx
│   │   │   └── CoordinationHub.tsx
│   │   ├── shared/
│   │   │   ├── RegionalMap.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── DateRangePicker.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Select.tsx
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   ├── auth.ts                 # Auth utilities
│   │   ├── metrics.ts              # Metrics helpers
│   │   └── utils.ts                # Utility functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMetrics.ts
│   │   ├── usePolicies.ts
│   │   └── useResources.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── icons/
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── tsconfig.json
```

### 3. Technical Requirements

#### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **Charts:** Recharts or Chart.js
- **Maps:** Leaflet or Mapbox (for regional visualization)
- **State:** React Query (TanStack Query) for server state
- **Forms:** React Hook Form with Zod validation

#### Key Features to Implement

**TBL Dashboard**
```typescript
interface TBLScore {
  people: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    components: {
      health: number;
      education: number;
      employment: number;
      housing: number;
    };
  };
  planet: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    components: {
      emissions: number;
      waste: number;
      biodiversity: number;
      water: number;
    };
  };
  profit: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    components: {
      gdp: number;
      employment: number;
      innovation: number;
      equity: number;
    };
  };
}
```

**Policy Implementation Tracker**
```typescript
interface PolicyImplementation {
  id: string;
  policyId: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number; // 0-100
  milestones: Milestone[];
  resources: AllocatedResource[];
  timeline: {
    startDate: Date;
    targetDate: Date;
    actualEndDate?: Date;
  };
  blockers: Blocker[];
}
```

#### API Integration
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  policies: {
    list: () => fetch(`${API_BASE}/api/v1/policies`),
    get: (id: string) => fetch(`${API_BASE}/api/v1/policies/${id}`),
    create: (data: PolicyCreate) => fetch(`${API_BASE}/api/v1/policies`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    // ...
  },
  metrics: {
    getTBL: (entityId: string) => fetch(`${API_BASE}/api/v1/metrics/tbl/${entityId}`),
    // ...
  },
  resources: {
    list: () => fetch(`${API_BASE}/api/v1/resources`),
    allocate: (data: Allocation) => fetch(`${API_BASE}/api/v1/resources/allocate`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    // ...
  }
};
```

### 4. Design Guidelines

- Use a professional, government-style design
- High contrast for accessibility (WCAG 2.1 AA minimum)
- Clear information hierarchy
- Responsive design (desktop-first, but mobile-friendly)
- Color scheme: Blues and grays with accent colors for metrics
  - People (TBL): Green
  - Planet (TBL): Blue
  - Profit (TBL): Gold/Orange

### 5. Access Control

This app is for **administrators** and **executives** only:
- Require `administrator` or `executive` role
- Show/hide features based on specific permissions
- Audit log all administrative actions

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 30-35 |
| Lines of Code | 3,000-3,500 |
| Pages | 10-12 |
| Components | 15-20 |

## Success Criteria

1. [ ] All pages rendering correctly
2. [ ] API integration working (mock if API not ready)
3. [ ] TBL dashboard with charts
4. [ ] Policy management CRUD
5. [ ] Resource allocation wizard
6. [ ] Emergency panel functional
7. [ ] Responsive design
8. [ ] TypeScript compiles without errors
9. [ ] ESLint passing

---

*Agent_9 Assignment - Executive Application*
