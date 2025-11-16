/**
 * Business Transparency System
 *
 * Replaces EEO regulations with radical transparency.
 * All employment decisions and supply chains are public.
 * Society decides what's acceptable through market forces.
 */

// Employment transparency
export {
  BusinessTransparencySystem,
  recordHiring,
  recordRejection,
  recordTermination,
  default as BusinessTransparency,
} from './employment';

export type {
  EmploymentAction,
  TerminationReason,
  PersonnelRecord,
  EmploymentEvent,
  EmploymentEventDetails,
  BusinessEntity,
  DecisionMaker,
  EmploymentPatternAnalysis,
} from './employment';

// Supply chain transparency
export {
  SupplyChainTransparencySystem,
  default as SupplyChainTransparency,
} from './supply-chain';

export type {
  MaterialType,
  SupplyChainStage,
  SupplyChainNode,
  MaterialFlow,
  GeographicLocation,
  LaborDetails,
  EnvironmentalImpact,
  SupplyChain,
  ConsumerSupplyChainReport,
  SupplyChainComparison,
} from './supply-chain';

// Progressive tax system
export {
  ProgressiveTaxSystem,
  calculateProgressiveTax,
  generateProgressiveTaxReport,
  compareOldVsNewTaxSystem,
  default as ProgressiveTax,
} from './progressive-tax';

export type {
  TaxBracket,
  TaxCalculation,
  BracketTaxBreakdown,
  TaxScenario,
  IncomeDistribution,
  RevenueImpact,
} from './progressive-tax';
