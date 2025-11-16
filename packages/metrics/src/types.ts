/**
 * Metrics Types
 * Triple Bottom Line (People, Planet, Profit) metrics tracking
 */

export enum MetricCategory {
  PEOPLE = 'people',
  PLANET = 'planet',
  PROFIT = 'profit',
}

export interface Metric {
  id: string;
  name: string;
  category: MetricCategory;
  description: string;
  unit: string;
  currentValue: number;
  targetValue?: number;
  historicalData: MetricDataPoint[];
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  source?: string;
  confidence?: number; // 0-1
}

export interface TripleBottomLineScore {
  people: number; // 0-100
  planet: number; // 0-100
  profit: number; // 0-100
  composite: number; // Weighted average
  timestamp: Date;
  tradeoffs: Tradeoff[];
}

export interface Tradeoff {
  category: MetricCategory;
  impact: number; // -100 to +100
  justification: string;
  alternatives: Alternative[];
}

export interface Alternative {
  description: string;
  estimatedImpact: TripleBottomLineScore;
  feasibility: number; // 0-1
}

export interface ImpactPrediction {
  shortTerm: TripleBottomLineScore; // 1 year
  mediumTerm: TripleBottomLineScore; // 5 years
  longTerm: TripleBottomLineScore; // 10 years
  uncertainty: UncertaintyRange;
  assumptions: string[];
}

export interface UncertaintyRange {
  people: { min: number; max: number };
  planet: { min: number; max: number };
  profit: { min: number; max: number };
}

export interface PerformanceTrigger {
  metricId: string;
  threshold: number;
  operator: 'above' | 'below';
  action: TriggerAction;
  adjustment?: PolicyAdjustment;
}

export enum TriggerAction {
  SUNSET = 'sunset',
  MODIFY = 'modify',
  EXTEND = 'extend',
  ESCALATE = 'escalate',
  ALERT = 'alert',
}

export interface PolicyAdjustment {
  description: string;
  parameters: Record<string, any>;
  expectedImpact: TripleBottomLineScore;
}

export interface RegionalMetrics {
  regionId: string;
  regionName: string;
  metrics: Metric[];
  score: TripleBottomLineScore;
  rank?: number;
  trends: MetricTrend[];
}

export interface MetricTrend {
  metricId: string;
  direction: 'improving' | 'declining' | 'stable';
  rate: number; // Rate of change
  significance: number; // Statistical significance
}

export interface BestPractice {
  id: string;
  regionId: string;
  policyId: string;
  category: string;
  description: string;
  metrics: {
    before: TripleBottomLineScore;
    after: TripleBottomLineScore;
  };
  duration: number; // Days
  transferability: number; // 0-1
  recommendations: string[];
}
