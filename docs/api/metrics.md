# Metrics API

> Triple Bottom Line metrics tracking for governance.

## Installation

```typescript
import {
  MetricsSystem,
  metricsSystem,
  MINIMUM_SCORES,
  DEFAULT_WEIGHTS,
  STANDARD_METRICS,
} from '@constitutional-shrinkage/metrics';
```

## Overview

The Metrics package provides:
- Triple Bottom Line (People, Planet, Profit) scoring
- Policy impact predictions
- Regional comparison analytics
- Trend analysis
- Automatic sunset evaluation based on outcomes

---

## Class: MetricsSystem

### Constructor

```typescript
const system = new MetricsSystem();
```

---

### Methods

#### `registerMetric(metric: Metric): void`

Register a new metric for tracking.

**Parameters:**
- `metric: Metric` - The metric definition

**Example:**
```typescript
metricsSystem.registerMetric({
  id: 'custom-metric-1',
  name: 'Community Engagement Index',
  category: MetricCategory.PEOPLE,
  description: 'Measures civic participation and community involvement',
  unit: 'score',
  currentValue: 0,
  targetValue: 80,
  historicalData: [],
});
```

---

#### `updateMetric(metricId, value, source?): void`

Update a metric's current value.

**Parameters:**
- `metricId: string` - ID of metric to update
- `value: number` - New value
- `source?: string` - Data source

**Throws:** `Metric ${metricId} not found`

**Example:**
```typescript
metricsSystem.updateMetric(
  'happiness-index',
  72.5,
  'Annual Survey 2025'
);
```

---

#### `calculateScore(regionId, weights?): TripleBottomLineScore`

Calculate composite Triple Bottom Line score for a region.

**Parameters:**
- `regionId: string` - Region to calculate for
- `weights?: object` - Optional custom weights (default: `DEFAULT_WEIGHTS`)

**Returns:** `TripleBottomLineScore`

**Throws:** `Region ${regionId} not found`

**Example:**
```typescript
// Register region first
metricsSystem.registerRegion({
  regionId: 'CA',
  regionName: 'California',
  metrics: [/* array of metrics */],
  lastUpdated: new Date(),
});

// Calculate score
const score = metricsSystem.calculateScore('CA');

console.log(`People: ${score.people}`);
console.log(`Planet: ${score.planet}`);
console.log(`Profit: ${score.profit}`);
console.log(`Composite: ${score.composite}`);

// Check for tradeoffs
if (score.tradeoffs.length > 0) {
  console.log('Tradeoffs detected:', score.tradeoffs);
}
```

---

#### `predictImpact(policyDescription, regionId, assumptions?): ImpactPrediction`

Predict the impact of a proposed policy.

**Parameters:**
- `policyDescription: string` - Description of the policy
- `regionId: string` - Region to predict for
- `assumptions?: string[]` - Additional assumptions

**Returns:** `ImpactPrediction`

**Example:**
```typescript
const prediction = metricsSystem.predictImpact(
  'Implement universal basic income of $1000/month',
  'CA',
  ['No inflation adjustment', 'Funded by wealth tax']
);

console.log('Short-term impact:', prediction.shortTerm);
console.log('Medium-term impact:', prediction.mediumTerm);
console.log('Long-term impact:', prediction.longTerm);
console.log('Uncertainty ranges:', prediction.uncertainty);
console.log('Assumptions:', prediction.assumptions);
```

---

#### `compareRegions(metricId, regionIds): Map<string, number>`

Compare a specific metric across multiple regions.

**Parameters:**
- `metricId: string` - Metric to compare
- `regionIds: string[]` - Regions to compare

**Returns:** `Map<string, number>` - Region ID to metric value

**Example:**
```typescript
const comparison = metricsSystem.compareRegions(
  'happiness-index',
  ['CA', 'TX', 'NY', 'FL']
);

comparison.forEach((value, region) => {
  console.log(`${region}: ${value}`);
});
```

---

#### `identifyBestPractices(category, minImprovement?): BestPractice[]`

Find best practices from high-performing regions.

**Parameters:**
- `category: string` - Category to search
- `minImprovement?: number` - Minimum improvement threshold (default: 10)

**Returns:** `BestPractice[]`

**Example:**
```typescript
const practices = metricsSystem.identifyBestPractices('ENVIRONMENT', 15);

practices.forEach(practice => {
  console.log(`Region: ${practice.regionId}`);
  console.log(`Policy: ${practice.policy}`);
  console.log(`Improvement: ${practice.metrics.after.composite - practice.metrics.before.composite}`);
});
```

---

#### `registerRegion(regional: RegionalMetrics): void`

Register a region's metrics for tracking.

**Parameters:**
- `regional: RegionalMetrics` - Regional metrics data

**Example:**
```typescript
metricsSystem.registerRegion({
  regionId: 'CA',
  regionName: 'California',
  metrics: [
    STANDARD_METRICS.HAPPINESS_INDEX,
    STANDARD_METRICS.CARBON_EMISSIONS,
    STANDARD_METRICS.GDP_PER_CAPITA,
  ],
  lastUpdated: new Date(),
});
```

---

#### `analyzeTrend(metricId): MetricTrend | null`

Analyze trends for a specific metric.

**Parameters:**
- `metricId: string` - Metric to analyze

**Returns:** `MetricTrend | null`

**Example:**
```typescript
const trend = metricsSystem.analyzeTrend('carbon-emissions');

if (trend) {
  console.log(`Direction: ${trend.direction}`); // 'improving', 'declining', 'stable'
  console.log(`Rate: ${trend.rate}%`);
  console.log(`Significance: ${trend.significance}`);
}
```

---

#### `meetsMinimumStandards(score: TripleBottomLineScore): boolean`

Check if a score meets minimum acceptable thresholds.

**Parameters:**
- `score: TripleBottomLineScore` - Score to evaluate

**Returns:** `boolean`

**Example:**
```typescript
const score = metricsSystem.calculateScore('CA');
const meetsStandards = metricsSystem.meetsMinimumStandards(score);

if (!meetsStandards) {
  console.log('Region does not meet minimum standards');
  console.log(`Minimum People: ${MINIMUM_SCORES.people}, Actual: ${score.people}`);
  console.log(`Minimum Planet: ${MINIMUM_SCORES.planet}, Actual: ${score.planet}`);
  console.log(`Minimum Profit: ${MINIMUM_SCORES.profit}, Actual: ${score.profit}`);
}
```

---

## Constants

### `MINIMUM_SCORES`

Minimum acceptable scores for each category:

```typescript
{
  people: 60,  // Quality of life threshold
  planet: 50,  // Environmental sustainability threshold
  profit: 40,  // Economic viability threshold
}
```

### `DEFAULT_WEIGHTS`

Default weights for composite score calculation:

```typescript
{
  people: 0.40,  // 40% weight
  planet: 0.35,  // 35% weight
  profit: 0.25,  // 25% weight
}
```

### `STANDARD_METRICS`

Pre-defined metrics for common measurements:

#### People Metrics
| ID | Name | Target |
|----|------|--------|
| `happiness-index` | Happiness Index | 80 |
| `health-outcomes` | Health Outcomes | 85 |
| `education-attainment` | Education Attainment | 90% |
| `incarceration-rate` | Incarceration Rate | 50 per 100k |

#### Planet Metrics
| ID | Name | Target |
|----|------|--------|
| `carbon-emissions` | Carbon Emissions | 2 tons CO2 |
| `renewable-energy` | Renewable Energy | 80% |
| `air-quality` | Air Quality | 90 AQI |

#### Profit Metrics
| ID | Name | Target |
|----|------|--------|
| `gdp-per-capita` | GDP Per Capita | $70,000 |
| `employment-rate` | Employment Rate | 95% |
| `innovation-index` | Innovation Index | 80 |

---

## Types

### `MetricCategory`

```typescript
enum MetricCategory {
  PEOPLE = 'PEOPLE',
  PLANET = 'PLANET',
  PROFIT = 'PROFIT',
}
```

### `Metric`

```typescript
interface Metric {
  id: string;
  name: string;
  category: MetricCategory;
  description: string;
  unit: string;
  currentValue: number;
  targetValue?: number;
  historicalData: HistoricalDataPoint[];
}
```

### `TripleBottomLineScore`

```typescript
interface TripleBottomLineScore {
  people: number;           // 0-100
  planet: number;           // 0-100
  profit: number;           // 0-100
  composite: number;        // Weighted average
  timestamp: Date;
  tradeoffs: Tradeoff[];    // Identified tradeoffs
}
```

### `ImpactPrediction`

```typescript
interface ImpactPrediction {
  shortTerm: TripleBottomLineScore;   // 1 year
  mediumTerm: TripleBottomLineScore;  // 3 years
  longTerm: TripleBottomLineScore;    // 10 years
  uncertainty: {
    people: { min: number; max: number };
    planet: { min: number; max: number };
    profit: { min: number; max: number };
  };
  assumptions: string[];
}
```

### `MetricTrend`

```typescript
interface MetricTrend {
  metricId: string;
  direction: 'improving' | 'declining' | 'stable';
  rate: number;           // Percentage change
  significance: number;   // 0-1, statistical significance
}
```

### `Tradeoff`

```typescript
interface Tradeoff {
  category: MetricCategory;
  impact: number;
  justification: string;
  alternatives: string[];
}
```

---

## Usage Examples

### Policy Evaluation Before Voting

```typescript
import { metricsSystem, MINIMUM_SCORES } from '@constitutional-shrinkage/metrics';

async function evaluatePolicy(billId: string, regionId: string) {
  // Get current baseline
  const baseline = metricsSystem.calculateScore(regionId);

  // Predict impact
  const prediction = metricsSystem.predictImpact(
    'Increase minimum wage to $20/hour',
    regionId
  );

  // Check if prediction meets standards
  const shortTermOk = metricsSystem.meetsMinimumStandards(prediction.shortTerm);
  const longTermOk = metricsSystem.meetsMinimumStandards(prediction.longTerm);

  console.log('Current Baseline:', baseline);
  console.log('Short-term prediction meets standards:', shortTermOk);
  console.log('Long-term prediction meets standards:', longTermOk);

  // Identify tradeoffs
  if (prediction.shortTerm.tradeoffs.length > 0) {
    console.log('Tradeoffs to consider:');
    prediction.shortTerm.tradeoffs.forEach(t => {
      console.log(`  - ${t.category}: ${t.justification}`);
    });
  }

  return {
    recommend: shortTermOk && longTermOk,
    prediction,
    baseline,
  };
}
```

### Regional Dashboard

```typescript
// Set up regional tracking
const regions = ['CA', 'TX', 'NY', 'FL'];

regions.forEach(region => {
  metricsSystem.registerRegion({
    regionId: region,
    regionName: region,
    metrics: Object.values(STANDARD_METRICS) as Metric[],
    lastUpdated: new Date(),
  });
});

// Compare all regions
function generateRegionalReport() {
  const report = regions.map(region => {
    const score = metricsSystem.calculateScore(region);
    return {
      region,
      people: score.people,
      planet: score.planet,
      profit: score.profit,
      composite: score.composite,
      meetsStandards: metricsSystem.meetsMinimumStandards(score),
    };
  });

  // Sort by composite score
  report.sort((a, b) => b.composite - a.composite);

  return report;
}
```

### Sunset Evaluation

```typescript
// Evaluate if a law should be renewed at sunset
function evaluateForSunset(billId: string, regionId: string) {
  const currentScore = metricsSystem.calculateScore(regionId);

  // Get relevant metrics for this bill's category
  const trend = metricsSystem.analyzeTrend('happiness-index');

  const recommendation = {
    renew: currentScore.composite >= 60 && trend?.direction !== 'declining',
    reason: '',
    suggestedChanges: [] as string[],
  };

  if (!recommendation.renew) {
    if (currentScore.people < MINIMUM_SCORES.people) {
      recommendation.suggestedChanges.push('Improve social outcomes');
    }
    if (currentScore.planet < MINIMUM_SCORES.planet) {
      recommendation.suggestedChanges.push('Improve environmental impact');
    }
    if (trend?.direction === 'declining') {
      recommendation.reason = `Metrics declining at ${trend.rate}% rate`;
    }
  }

  return recommendation;
}
```

---

## Best Practices

1. **Update metrics regularly** - Stale data leads to poor predictions
2. **Use multiple data sources** - Cross-validate with different sources
3. **Consider uncertainty** - Don't treat predictions as certainties
4. **Monitor tradeoffs** - High scores in one area shouldn't mask problems in others
5. **Set realistic targets** - Targets should be achievable but ambitious
6. **Compare across regions** - Learn from high performers
