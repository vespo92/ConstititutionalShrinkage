# Agent_12: Supply Chain Transparency Application

## Mission
Build the Supply Chain application in `apps/supply-chain/` - a platform for visualizing supply chains, calculating economic distance, tracking producer-to-consumer flows, and managing locality-based taxation for sustainable commerce.

## Branch
```
claude/agent-12-supply-chain-app-{session-id}
```

## Priority: MEDIUM

## Context
This app supports the economic transparency pillar of Constitutional Shrinkage:
- Incentivize local commerce through economic distance taxation
- Full supply chain visibility from producer to consumer
- Business transparency scoring
- Integration with `packages/business-transparency`

## Target Directory
```
apps/supply-chain/
```

## Your Deliverables

### 1. Pages to Implement

#### Dashboard (/)
- Supply chain overview
- Key economic metrics
- Top local producers
- Distance taxation revenue
- Transparency leaderboard

#### Network Visualization (/network)
- Interactive supply chain graph
- Node types: producers, distributors, retailers, consumers
- Edge weights: distance, transactions
- Filtering and search
- Zoom and pan navigation

#### Entity Chain (/network/[entityId])
- Single entity's supply chain
- Upstream suppliers
- Downstream customers
- Geographic spread
- Economic distance breakdown

#### Distance Calculator (/distance)
- Calculate economic distance between points
- Multi-hop supply chain analysis
- Alternative route suggestions
- Cost comparison with local options

#### Calculation Results (/distance/results)
- Detailed distance breakdown
- Tax implications
- Environmental impact
- Recommendations

#### Product Tracking (/tracking)
- Track products through supply chain
- Real-time location (where available)
- Origin verification
- Chain of custody

#### Product Detail (/tracking/[productId])
- Product journey visualization
- All handlers in chain
- Timestamps at each hop
- Verification status
- Total distance traveled

#### Locality Taxes (/taxes)
- Tax overview dashboard
- Revenue by region
- Tax rate tiers by distance
- Exemptions and incentives

#### Tax Calculator (/taxes/calculate)
- Calculate taxes for transactions
- Input origin and destination
- Product category selection
- Exemption eligibility check

#### Transparency Reports (/transparency)
- Business transparency scores
- Ranking and comparison
- Verification badges
- Public disclosure reports

#### Organization Report (/transparency/[orgId])
- Full transparency report
- Supply chain disclosure
- Employment practices
- Environmental footprint
- TBL score integration

#### Report Generation (/reports)
- Custom report builder
- Export to PDF/CSV
- Scheduled reports
- Historical data

### 2. File Structure

```
apps/supply-chain/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── network/
│   │   │   ├── page.tsx            # Network visualization
│   │   │   ├── [entityId]/page.tsx # Entity chain view
│   │   │   └── explore/page.tsx    # Explore mode
│   │   ├── distance/
│   │   │   ├── page.tsx            # Distance calculator
│   │   │   └── results/page.tsx    # Calculation results
│   │   ├── tracking/
│   │   │   ├── page.tsx            # Product tracking home
│   │   │   ├── [productId]/page.tsx # Product journey
│   │   │   └── verify/page.tsx     # Verification tool
│   │   ├── taxes/
│   │   │   ├── page.tsx            # Tax overview
│   │   │   ├── calculate/page.tsx  # Tax calculator
│   │   │   ├── rates/page.tsx      # Rate tables
│   │   │   └── exemptions/page.tsx # Exemptions
│   │   ├── transparency/
│   │   │   ├── page.tsx            # Transparency reports
│   │   │   ├── [orgId]/page.tsx    # Organization report
│   │   │   └── rankings/page.tsx   # Leaderboard
│   │   ├── reports/
│   │   │   ├── page.tsx            # Report builder
│   │   │   └── archive/page.tsx    # Historical reports
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── network/
│   │   │   ├── NetworkGraph.tsx      # Main D3/Vis.js graph
│   │   │   ├── GraphControls.tsx     # Zoom, filter controls
│   │   │   ├── NodeDetail.tsx        # Node popup/panel
│   │   │   ├── EdgeDetail.tsx        # Edge info
│   │   │   ├── GraphLegend.tsx
│   │   │   └── GraphFilters.tsx
│   │   ├── distance/
│   │   │   ├── DistanceCalculator.tsx
│   │   │   ├── RouteMap.tsx
│   │   │   ├── DistanceBreakdown.tsx
│   │   │   └── AlternativeRoutes.tsx
│   │   ├── tracking/
│   │   │   ├── ProductJourney.tsx    # Timeline visualization
│   │   │   ├── ChainTracker.tsx
│   │   │   ├── VerificationBadge.tsx
│   │   │   └── LocationMarker.tsx
│   │   ├── taxes/
│   │   │   ├── TaxCalculator.tsx
│   │   │   ├── TaxBreakdown.tsx
│   │   │   ├── RateTable.tsx
│   │   │   └── ExemptionCheck.tsx
│   │   ├── transparency/
│   │   │   ├── TransparencyScore.tsx
│   │   │   ├── TransparencyReport.tsx
│   │   │   ├── RankingTable.tsx
│   │   │   └── VerificationBadges.tsx
│   │   ├── shared/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   └── SearchBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Slider.tsx
│   │       └── Tooltip.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── visualization.ts        # D3/Vis.js helpers
│   │   ├── calculations.ts         # Distance/tax calculations
│   │   ├── geo.ts                  # Geographic utilities
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useGraph.ts
│   │   ├── useDistance.ts
│   │   └── useTransparency.ts
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

#### Network Graph Visualization
```typescript
// Use D3.js or Vis.js for interactive network graphs
interface NetworkNode {
  id: string;
  type: 'producer' | 'distributor' | 'retailer' | 'consumer';
  name: string;
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  metrics: {
    transparencyScore: number;
    volumeHandled: number;
    avgDistance: number;
  };
}

interface NetworkEdge {
  source: string;
  target: string;
  weight: number;           // Transaction volume
  distance: number;         // Economic distance
  productTypes: string[];
  transactionCount: number;
}

// Graph visualization features:
// - Force-directed layout
// - Geographic layout option
// - Node sizing by volume
// - Edge coloring by distance (green = local, red = distant)
// - Click to expand/collapse nodes
// - Search and highlight paths
```

#### Economic Distance Calculation
```typescript
// From packages/business-transparency
interface EconomicDistance {
  straightLine: number;        // km between points
  supplyChainHops: number;     // Number of intermediaries
  totalDistance: number;       // Sum of all hops
  carbonFootprint: number;     // Estimated CO2
  localityScore: number;       // 0-100 (100 = very local)
  taxRate: number;             // Applicable tax rate
}

// Distance tiers (example)
const distanceTiers = [
  { maxDistance: 50, taxRate: 0, label: 'Local' },
  { maxDistance: 200, taxRate: 0.01, label: 'Regional' },
  { maxDistance: 500, taxRate: 0.03, label: 'National' },
  { maxDistance: Infinity, taxRate: 0.05, label: 'International' }
];
```

#### Product Journey Tracking
```typescript
interface ProductJourney {
  productId: string;
  productName: string;
  origin: {
    entity: string;
    location: string;
    timestamp: Date;
  };
  hops: JourneyHop[];
  currentStatus: 'in_transit' | 'delivered' | 'returned';
  totalDistance: number;
  verificationStatus: 'verified' | 'partial' | 'unverified';
}

interface JourneyHop {
  sequence: number;
  entity: string;
  action: 'received' | 'processed' | 'shipped';
  location: string;
  timestamp: Date;
  distanceFromPrevious: number;
  verified: boolean;
}
```

#### Business Transparency Integration
```typescript
// From packages/business-transparency
import {
  calculateTransparencyScore,
  getSupplyChainDisclosure,
  getEmploymentPractices,
  calculateEconomicDistance
} from '@constitutional/business-transparency';

interface TransparencyReport {
  organization: Organization;
  overallScore: number;
  components: {
    supplyChain: {
      score: number;
      disclosure: DisclosureLevel;
      verifiedSuppliers: number;
      totalSuppliers: number;
    };
    employment: {
      score: number;
      wageFairness: number;
      benefits: number;
      safety: number;
    };
    environmental: {
      score: number;
      emissions: number;
      wasteManagement: number;
      sustainability: number;
    };
  };
  badges: Badge[];
  certifications: Certification[];
}
```

### 4. Visualization Libraries

```json
// package.json dependencies for visualization
{
  "dependencies": {
    "d3": "^7.8.5",
    "@visx/visx": "^3.5.0",
    "react-force-graph": "^1.44.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

### 5. Design Guidelines

- Data-visualization focused design
- Clean, modern dashboard aesthetic
- Clear data hierarchies
- Interactive and explorable
- Color-coded by distance (green = local, red = far)

Color scheme:
- Local: Greens (#22c55e family)
- Regional: Blues (#3b82f6 family)
- National: Yellows (#eab308 family)
- International: Reds (#ef4444 family)
- Verified: Gold badges

### 6. Access Control

Multiple access levels:
- **Public**: View transparency reports, product tracking
- **Businesses**: Manage their own supply chain data
- **Auditors**: Verify and audit supply chains
- **Administrators**: Manage tax rates, exemptions

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 30-35 |
| Lines of Code | 3,500-4,000 |
| Pages | 12-15 |
| Components | 15-20 |

## Success Criteria

1. [ ] Network graph visualization working
2. [ ] Economic distance calculator functional
3. [ ] Product journey tracking
4. [ ] Tax calculator with rate tables
5. [ ] Transparency reports generating
6. [ ] Export to PDF/CSV
7. [ ] Mobile-responsive design
8. [ ] TypeScript compiles without errors

---

*Agent_12 Assignment - Supply Chain Transparency Application*
