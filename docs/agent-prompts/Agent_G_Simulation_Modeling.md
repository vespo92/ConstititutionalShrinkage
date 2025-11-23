# Agent_G: Policy Simulation & Modeling Engine

## Mission
Build a simulation engine that allows citizens and policymakers to model the potential impacts of legislation before voting, running "what-if" scenarios, comparing policy alternatives, and visualizing predicted outcomes across People, Planet, and Profit dimensions.

## Branch
```
claude/agent-G-simulation-modeling-{session-id}
```

## Priority: MEDIUM

## Context
Better decisions require better predictions:
- Model economic impacts before passing bills
- Simulate environmental effects of policies
- Predict social outcomes and inequality changes
- Compare alternative policy approaches
- A/B test policies across regions (experimentally)
- Learn from historical policy outcomes

## Target Directories
```
services/simulation-service/
apps/simulation/
packages/modeling/
```

## Your Deliverables

### 1. Simulation Service

```
services/simulation-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── simulations.ts          # CRUD simulations
│   │   ├── scenarios.ts            # Scenario management
│   │   ├── models.ts               # Model configuration
│   │   └── results.ts              # Results retrieval
│   ├── engines/
│   │   ├── economic/
│   │   │   ├── gdp-model.ts
│   │   │   ├── employment-model.ts
│   │   │   ├── tax-revenue-model.ts
│   │   │   └── small-business-model.ts
│   │   ├── environmental/
│   │   │   ├── carbon-model.ts
│   │   │   ├── resource-model.ts
│   │   │   ├── supply-chain-distance.ts
│   │   │   └── renewable-adoption.ts
│   │   ├── social/
│   │   │   ├── inequality-model.ts
│   │   │   ├── access-model.ts
│   │   │   ├── participation-model.ts
│   │   │   └── wellbeing-model.ts
│   │   └── composite/
│   │       ├── tbl-aggregator.ts   # Combine all models
│   │       └── trade-off-analyzer.ts
│   ├── services/
│   │   ├── runner.ts               # Simulation runner
│   │   ├── scheduler.ts            # Background jobs
│   │   ├── monte-carlo.ts          # Uncertainty modeling
│   │   ├── sensitivity.ts          # Sensitivity analysis
│   │   └── comparison.ts           # Policy comparison
│   ├── data/
│   │   ├── historical-loader.ts    # Load historical data
│   │   ├── regional-data.ts        # Regional parameters
│   │   └── calibration.ts          # Model calibration
│   ├── lib/
│   │   ├── statistics.ts
│   │   └── time-series.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Simulation Application (UI)

```
apps/simulation/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Simulation home
│   │   ├── new/
│   │   │   └── page.tsx                # Create simulation
│   │   ├── [id]/
│   │   │   ├── page.tsx                # Simulation detail
│   │   │   ├── configure/page.tsx      # Configure params
│   │   │   ├── run/page.tsx            # Running view
│   │   │   └── results/page.tsx        # Results view
│   │   ├── compare/
│   │   │   └── page.tsx                # Compare scenarios
│   │   ├── library/
│   │   │   └── page.tsx                # Saved simulations
│   │   └── sandbox/
│   │       └── page.tsx                # Quick sandbox
│   ├── components/
│   │   ├── config/
│   │   │   ├── ParameterSlider.tsx
│   │   │   ├── ScenarioBuilder.tsx
│   │   │   ├── RegionSelector.tsx
│   │   │   └── TimeHorizonPicker.tsx
│   │   ├── visualization/
│   │   │   ├── TBLSpider.tsx           # Spider/radar chart
│   │   │   ├── TimelineChart.tsx       # Outcomes over time
│   │   │   ├── SensitivityPlot.tsx     # Tornado diagram
│   │   │   ├── UncertaintyBand.tsx     # Confidence intervals
│   │   │   ├── ComparisonMatrix.tsx    # Policy comparison
│   │   │   ├── TradeOffPlot.tsx        # Trade-off visualization
│   │   │   └── GeoImpactMap.tsx        # Regional impact map
│   │   ├── results/
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── DetailedBreakdown.tsx
│   │   │   └── RecommendationPanel.tsx
│   │   └── common/
│   │       ├── SimulationCard.tsx
│   │       └── ProgressIndicator.tsx
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   ├── useScenario.ts
│   │   └── useComparison.ts
│   └── lib/
│       └── api.ts
├── package.json
└── tsconfig.json
```

### 3. Modeling Package

```
packages/modeling/
├── src/
│   ├── models/
│   │   ├── base-model.ts           # Base model class
│   │   ├── economic-model.ts
│   │   ├── environmental-model.ts
│   │   ├── social-model.ts
│   │   └── composite-model.ts
│   ├── utils/
│   │   ├── distributions.ts        # Statistical distributions
│   │   ├── interpolation.ts
│   │   ├── optimization.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Core Simulation Features

#### Policy Impact Model
```typescript
interface PolicySimulation {
  // Core simulation parameters
  billId: string;
  region: string;
  timeHorizon: number;              // Years
  confidenceLevel: number;          // 0.90, 0.95, etc.

  // Economic parameters
  economic: {
    baselineGdp: number;
    taxRateChanges: TaxChange[];
    spendingChanges: SpendingChange[];
    regulatoryBurden: number;       // Index
  };

  // Environmental parameters
  environmental: {
    baselineCarbon: number;
    supplyChainLocality: number;    // % local
    energyMix: EnergyMix;
    resourceConsumption: number;
  };

  // Social parameters
  social: {
    populationAffected: number;
    accessibilityChange: number;    // Index
    inequalityImpact: number;       // Gini coefficient delta
  };
}

interface SimulationResult {
  id: string;
  billId: string;
  status: 'completed' | 'running' | 'failed';

  // Triple Bottom Line outcomes
  people: {
    predicted: number;              // -100 to +100
    confidence: [number, number];   // 95% CI
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  planet: {
    predicted: number;
    confidence: [number, number];
    carbonDelta: number;            // tons CO2
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  profit: {
    predicted: number;
    confidence: [number, number];
    economicImpact: number;         // $ value
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  // Sensitivity analysis
  sensitivities: SensitivityResult[];

  // Trade-offs identified
  tradeOffs: TradeOff[];

  // Recommendations
  recommendations: Recommendation[];
}
```

#### Monte Carlo Uncertainty
```typescript
interface MonteCarloSimulation {
  // Run N simulations with parameter variation
  run(
    baseScenario: Scenario,
    iterations: number,
    parameterRanges: ParameterRange[]
  ): Promise<MonteCarloResult>;
}

interface MonteCarloResult {
  iterations: number;
  outcomes: {
    people: Distribution;
    planet: Distribution;
    profit: Distribution;
  };
  percentiles: {
    p5: TBLScore;
    p25: TBLScore;
    p50: TBLScore;
    p75: TBLScore;
    p95: TBLScore;
  };
  riskAnalysis: {
    probabilityOfNegativeOutcome: number;
    worstCase: TBLScore;
    bestCase: TBLScore;
  };
}
```

#### Policy Comparison
```typescript
interface PolicyComparison {
  // Compare multiple policies
  compare(
    policies: Policy[],
    region: string,
    timeHorizon: number
  ): Promise<ComparisonResult>;
}

interface ComparisonResult {
  policies: PolicyOutcome[];
  rankings: {
    overall: PolicyRanking[];
    byPeople: PolicyRanking[];
    byPlanet: PolicyRanking[];
    byProfit: PolicyRanking[];
  };
  tradeOffMatrix: TradeOffMatrix;
  paretoFrontier: Policy[];         // Non-dominated solutions
  recommendation: {
    bestOverall: string;
    bestForPeople: string;
    bestForPlanet: string;
    bestForProfit: string;
    balancedChoice: string;
    reasoning: string;
  };
}
```

#### Scenario Builder
```typescript
// Interactive scenario configuration
interface ScenarioBuilder {
  // Base scenarios
  templates: {
    conservative: ScenarioTemplate;
    moderate: ScenarioTemplate;
    aggressive: ScenarioTemplate;
    custom: ScenarioTemplate;
  };

  // Parameter adjustment
  adjustParameter(
    param: string,
    value: number | string
  ): ScenarioBuilder;

  // Regional customization
  forRegion(regionId: string): ScenarioBuilder;

  // Build and validate
  build(): Scenario;
  validate(): ValidationResult;
}
```

### 5. Historical Learning

```typescript
// Learn from historical policy outcomes
interface HistoricalAnalysis {
  // Find similar historical policies
  findSimilar(
    billContent: string,
    limit: number
  ): Promise<HistoricalPolicy[]>;

  // Analyze actual outcomes
  getOutcomes(
    policyId: string
  ): Promise<ActualOutcome>;

  // Calibrate models based on history
  calibrate(
    historicalData: HistoricalPolicy[]
  ): Promise<CalibrationResult>;

  // Accuracy tracking
  trackPredictionAccuracy(): Promise<AccuracyReport>;
}
```

## API Endpoints

```yaml
Simulations:
  POST   /simulations                # Create simulation
  GET    /simulations                # List simulations
  GET    /simulations/:id            # Get simulation
  POST   /simulations/:id/run        # Run simulation
  GET    /simulations/:id/results    # Get results
  DELETE /simulations/:id            # Delete simulation

Scenarios:
  POST   /scenarios                  # Create scenario
  GET    /scenarios                  # List scenarios
  GET    /scenarios/:id              # Get scenario
  PUT    /scenarios/:id              # Update scenario

Comparison:
  POST   /compare                    # Compare policies
  GET    /compare/:id                # Get comparison results

Analysis:
  POST   /analyze/sensitivity        # Sensitivity analysis
  POST   /analyze/monte-carlo        # Monte Carlo analysis
  GET    /analyze/historical         # Historical similar policies

Quick Sandbox:
  POST   /sandbox/quick              # Quick simulation (cached)
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Simulation Models | 15-20 |
| UI Pages | 10-15 |
| Visualization Components | 10-15 |
| Lines of Code | 12,000-15,000 |
| Simulation Time | <30s for basic |

## Success Criteria

1. [ ] Economic impact model working
2. [ ] Environmental impact model working
3. [ ] Social impact model working
4. [ ] TBL aggregation producing sensible results
5. [ ] Monte Carlo uncertainty analysis running
6. [ ] Sensitivity analysis identifying key parameters
7. [ ] Policy comparison tool functional
8. [ ] Interactive UI for scenario building
9. [ ] Historical policy data integrated
10. [ ] Model calibration process documented

---

*Agent_G Assignment - Policy Simulation & Modeling*
