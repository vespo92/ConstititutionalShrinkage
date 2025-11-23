/**
 * Core types for policy simulation and modeling
 */

// Distribution types for statistical modeling
export interface Distribution {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number[];
  percentiles: Record<number, number>;
}

// Time series data for projections
export interface TimeSeriesData {
  timestamps: Date[];
  values: number[];
  confidenceLower: number[];
  confidenceUpper: number[];
}

// Triple Bottom Line Score
export interface TBLScore {
  people: number;   // -100 to +100
  planet: number;   // -100 to +100
  profit: number;   // -100 to +100
  timestamp?: Date;
}

// Factor contributing to a score
export interface Factor {
  name: string;
  weight: number;
  value: number;
  description: string;
  source?: string;
}

// Trade-off between competing objectives
export interface TradeOff {
  dimension1: 'people' | 'planet' | 'profit';
  dimension2: 'people' | 'planet' | 'profit';
  correlation: number;
  description: string;
  mitigationStrategies?: string[];
}

// Tax change specification
export interface TaxChange {
  category: string;
  currentRate: number;
  proposedRate: number;
  affectedPopulation: number;
}

// Spending change specification
export interface SpendingChange {
  category: string;
  currentAmount: number;
  proposedAmount: number;
  effectiveDate: Date;
}

// Energy mix for environmental modeling
export interface EnergyMix {
  coal: number;
  naturalGas: number;
  nuclear: number;
  solar: number;
  wind: number;
  hydro: number;
  other: number;
}

// Policy simulation configuration
export interface PolicySimulation {
  id?: string;
  billId: string;
  region: string;
  timeHorizon: number;           // Years
  confidenceLevel: number;        // 0.90, 0.95, etc.

  economic: {
    baselineGdp: number;
    taxRateChanges: TaxChange[];
    spendingChanges: SpendingChange[];
    regulatoryBurden: number;     // Index 0-100
  };

  environmental: {
    baselineCarbon: number;       // tons CO2/year
    supplyChainLocality: number;  // % local
    energyMix: EnergyMix;
    resourceConsumption: number;  // Index
  };

  social: {
    populationAffected: number;
    accessibilityChange: number;  // Index -100 to +100
    inequalityImpact: number;     // Gini coefficient delta
  };
}

// Simulation result output
export interface SimulationResult {
  id: string;
  billId: string;
  simulationId: string;
  status: 'completed' | 'running' | 'failed' | 'pending';
  createdAt: Date;
  completedAt?: Date;

  people: {
    predicted: number;
    confidence: [number, number];
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  planet: {
    predicted: number;
    confidence: [number, number];
    carbonDelta: number;
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  profit: {
    predicted: number;
    confidence: [number, number];
    economicImpact: number;
    factors: Factor[];
    timeline: TimeSeriesData;
  };

  sensitivities: SensitivityResult[];
  tradeOffs: TradeOff[];
  recommendations: Recommendation[];
}

// Sensitivity analysis result
export interface SensitivityResult {
  parameter: string;
  baseValue: number;
  range: [number, number];
  impactOnPeople: number;
  impactOnPlanet: number;
  impactOnProfit: number;
  elasticity: number;
}

// Policy recommendation
export interface Recommendation {
  type: 'warning' | 'suggestion' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  relatedFactors: string[];
}

// Monte Carlo configuration
export interface MonteCarloConfig {
  iterations: number;
  seed?: number;
  parameterRanges: ParameterRange[];
}

// Parameter range for uncertainty
export interface ParameterRange {
  name: string;
  distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal';
  params: number[];  // Distribution-specific parameters
}

// Monte Carlo result
export interface MonteCarloResult {
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

// Scenario template
export interface ScenarioTemplate {
  name: string;
  description: string;
  parameters: Record<string, number | string>;
}

// Scenario configuration
export interface Scenario {
  id?: string;
  name: string;
  template: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  region?: string;
  parameters: Record<string, number | string>;
  createdAt?: Date;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Historical policy for learning
export interface HistoricalPolicy {
  id: string;
  title: string;
  content: string;
  enactedDate: Date;
  region: string;
  predictedOutcome?: TBLScore;
  actualOutcome?: TBLScore;
  similarity?: number;
}

// Actual outcome from historical data
export interface ActualOutcome {
  policyId: string;
  measuredAt: Date;
  people: number;
  planet: number;
  profit: number;
  notes: string;
}

// Model calibration result
export interface CalibrationResult {
  modelId: string;
  calibratedAt: Date;
  samplesUsed: number;
  meanAbsoluteError: number;
  correlationCoefficient: number;
  adjustments: Record<string, number>;
}

// Policy comparison result
export interface PolicyRanking {
  policyId: string;
  score: number;
  rank: number;
}

export interface PolicyOutcome {
  policyId: string;
  policyName: string;
  tblScore: TBLScore;
  confidence: number;
}

export interface ComparisonResult {
  policies: PolicyOutcome[];
  rankings: {
    overall: PolicyRanking[];
    byPeople: PolicyRanking[];
    byPlanet: PolicyRanking[];
    byProfit: PolicyRanking[];
  };
  tradeOffMatrix: number[][];
  paretoFrontier: string[];
  recommendation: {
    bestOverall: string;
    bestForPeople: string;
    bestForPlanet: string;
    bestForProfit: string;
    balancedChoice: string;
    reasoning: string;
  };
}

// Accuracy tracking
export interface AccuracyReport {
  modelId: string;
  generatedAt: Date;
  totalPredictions: number;
  meanAbsoluteError: {
    people: number;
    planet: number;
    profit: number;
  };
  correlations: {
    people: number;
    planet: number;
    profit: number;
  };
  outliers: string[];
}
