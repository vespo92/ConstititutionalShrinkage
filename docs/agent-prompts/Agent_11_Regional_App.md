# Agent_11: Regional Governance Application

## Mission
Build the Regional Governance application in `apps/regional-governance/` - a platform for managing decentralized regional "pods", local legislation, inter-region coordination, and community engagement.

## Branch
```
claude/agent-11-regional-app-{session-id}
```

## Priority: MEDIUM

## Context
You are building a Next.js 14 frontend for managing the decentralized governance model where:
- Government is organized into regional "pods"
- Each pod has local autonomy within constitutional bounds
- Pods coordinate on cross-regional issues
- Citizens engage with their local pod governance

## Target Directory
```
apps/regional-governance/
```

## Your Deliverables

### 1. Pages to Implement

#### Dashboard (/)
- Regional overview map
- Key statistics for user's region
- Recent local legislation
- Upcoming community events
- Cross-regional coordination updates

#### Pods (/pods)
- List all regional pods
- Filter by state, population, status
- Search functionality
- Pod comparison tools
- Create new pod proposal

#### Pod Detail (/pods/[id])
- Pod overview and statistics
- Local leadership
- Active legislation
- Resource allocation
- Population demographics
- Performance metrics (TBL)
- Pod boundaries (map)

#### Pod Management (/pods/[id]/manage)
- Pod administration tools
- Update pod information
- Manage leadership
- Boundary adjustments
- Resource requests

#### Pod Comparison (/pods/compare)
- Compare multiple pods
- Side-by-side metrics
- Best practices identification
- Performance benchmarking

#### Local Legislation (/legislation)
- Regional/local legislation list
- Scope indicators (local vs regional)
- Status tracking
- Voting sessions

#### Legislation Detail (/legislation/[id])
- Full legislation text
- Local impact assessment
- Constitutional compliance
- Voting interface (if active)
- Implementation status

#### Coordination (/coordination)
- Inter-pod coordination requests
- Active cross-regional initiatives
- Resource sharing agreements
- Conflict resolution queue

#### Coordination Requests (/coordination/requests)
- Submit coordination request
- Request status tracking
- Response management

#### Community (/community)
- Community engagement hub
- Discussion forums
- Town hall announcements
- Citizen feedback portal
- Volunteer opportunities

#### Forums (/community/forums)
- Discussion boards by topic
- Q&A sections
- Moderation tools

#### Map View (/map)
- Interactive regional map
- Pod boundaries visualization
- Filter by metrics
- Drill-down to pod details
- Cross-regional overlays

### 2. File Structure

```
apps/regional-governance/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Regional dashboard
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── pods/
│   │   │   ├── page.tsx            # Pod list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Pod detail
│   │   │   │   ├── manage/page.tsx # Pod management
│   │   │   │   ├── legislation/page.tsx
│   │   │   │   └── members/page.tsx
│   │   │   ├── create/page.tsx     # Propose new pod
│   │   │   └── compare/page.tsx    # Compare pods
│   │   ├── legislation/
│   │   │   ├── page.tsx            # Local legislation list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx        # Legislation detail
│   │   │   │   └── vote/page.tsx   # Voting interface
│   │   │   └── propose/page.tsx    # Propose legislation
│   │   ├── coordination/
│   │   │   ├── page.tsx            # Coordination overview
│   │   │   ├── requests/page.tsx   # Request management
│   │   │   ├── initiatives/page.tsx # Active initiatives
│   │   │   └── [id]/page.tsx       # Initiative detail
│   │   ├── community/
│   │   │   ├── page.tsx            # Community hub
│   │   │   ├── forums/
│   │   │   │   ├── page.tsx        # Forum list
│   │   │   │   ├── [topicId]/page.tsx
│   │   │   │   └── new/page.tsx    # Create post
│   │   │   ├── events/page.tsx     # Community events
│   │   │   └── feedback/page.tsx   # Citizen feedback
│   │   ├── map/
│   │   │   └── page.tsx            # Interactive map
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── RegionSelector.tsx
│   │   ├── pods/
│   │   │   ├── PodCard.tsx
│   │   │   ├── PodList.tsx
│   │   │   ├── PodDetail.tsx
│   │   │   ├── PodCompare.tsx
│   │   │   ├── LeadershipPanel.tsx
│   │   │   └── PodMetrics.tsx
│   │   ├── legislation/
│   │   │   ├── LegislationCard.tsx
│   │   │   ├── LocalBillViewer.tsx
│   │   │   ├── ImpactAssessment.tsx
│   │   │   └── VotingPanel.tsx
│   │   ├── coordination/
│   │   │   ├── CoordinationCard.tsx
│   │   │   ├── RequestForm.tsx
│   │   │   ├── InitiativeTracker.tsx
│   │   │   └── ResourceSharing.tsx
│   │   ├── community/
│   │   │   ├── ForumPost.tsx
│   │   │   ├── DiscussionThread.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   └── CommunityFeed.tsx
│   │   ├── map/
│   │   │   ├── RegionalMap.tsx       # Main map component
│   │   │   ├── PodBoundaries.tsx     # Pod boundary layer
│   │   │   ├── MapControls.tsx
│   │   │   ├── MapLegend.tsx
│   │   │   └── MapPopup.tsx
│   │   ├── shared/
│   │   │   ├── MetricsDashboard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── SearchBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Tabs.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── geo.ts                  # Geographic utilities
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePods.ts
│   │   ├── useRegion.ts
│   │   └── useMap.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── geo/                        # GeoJSON files
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

### 3. Key Features

#### Regional Pod Model
```typescript
interface Pod {
  id: string;
  name: string;
  code: string;           // e.g., "CA-SF", "TX-AUS"
  type: 'municipal' | 'county' | 'regional' | 'state';
  status: 'active' | 'forming' | 'merging' | 'dissolved';
  boundaries: GeoJSON.Polygon;
  population: number;
  leadership: Leader[];
  parentPod?: string;     // Hierarchical structure
  childPods?: string[];
  createdAt: Date;
  metrics: PodMetrics;
}

interface PodMetrics {
  tblScore: TBLScore;
  citizenSatisfaction: number;
  participationRate: number;
  legislationPassed: number;
  resourceEfficiency: number;
}
```

#### Inter-Pod Coordination
```typescript
interface CoordinationRequest {
  id: string;
  type: 'resource_sharing' | 'joint_initiative' | 'conflict_resolution' | 'boundary_adjustment';
  status: 'pending' | 'accepted' | 'negotiating' | 'completed' | 'rejected';
  requestingPod: string;
  targetPods: string[];
  title: string;
  description: string;
  resources?: ResourceRequest[];
  timeline: Timeline;
  votes: PodVote[];
}
```

#### Interactive Map
```typescript
// Use Leaflet or Mapbox for mapping
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';

interface MapProps {
  pods: Pod[];
  selectedPod?: string;
  colorBy: 'tblScore' | 'population' | 'participationRate';
  showLabels: boolean;
  onPodClick: (podId: string) => void;
}

// Features:
// - Zoom to user's region on load
// - Color-coded pods by selected metric
// - Click pods to see details
// - Toggle different overlays (boundaries, metrics, etc.)
// - Search/filter controls
```

### 4. Design Guidelines

- Warm, community-oriented design
- Geographic/map focus
- Clear regional identity
- Mobile-responsive (citizens use phones)
- Accessible for all demographics

Color scheme:
- Primary: Earth tones (greens, browns)
- Secondary: Regional accent colors
- Maps: Choropleth coloring based on metrics

### 5. Access Control

Multiple access levels:
- **Citizens**: View-only for most, can participate in community forums
- **Pod Members**: Can vote on local legislation
- **Pod Leadership**: Can manage pod, create legislation
- **Regional Coordinators**: Cross-pod coordination powers

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 30-35 |
| Lines of Code | 3,000-3,500 |
| Pages | 12-15 |
| Components | 15-20 |

## Success Criteria

1. [ ] All pages rendering correctly
2. [ ] Interactive map with pod boundaries
3. [ ] Pod management CRUD operations
4. [ ] Coordination request workflow
5. [ ] Community forums functional
6. [ ] Mobile-responsive design
7. [ ] TypeScript compiles without errors

---

*Agent_11 Assignment - Regional Governance Application*
