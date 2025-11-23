/**
 * @constitutional/modeling
 *
 * Policy simulation and impact modeling package for Constitutional Shrinkage.
 * Provides economic, environmental, and social models for predicting policy outcomes.
 */

// Types
export * from './types';

// Base model
export { BaseModel, CompositeModel } from './models/base-model';
export type { ModelConfig, ModelInput, ModelOutput } from './models/base-model';

// Economic models
export {
  GDPModel,
  EmploymentModel,
  SmallBusinessModel
} from './models/economic-model';
export type { EconomicModelInput } from './models/economic-model';

// Environmental models
export {
  CarbonModel,
  ResourceModel,
  SupplyChainDistanceModel,
  RenewableAdoptionModel
} from './models/environmental-model';
export type { EnvironmentalModelInput } from './models/environmental-model';

// Social models
export {
  InequalityModel,
  AccessModel,
  ParticipationModel,
  WellbeingModel
} from './models/social-model';
export type { SocialModelInput } from './models/social-model';

// Composite models
export { TBLAggregator, TradeOffAnalyzer } from './models/composite-model';
export type { TBLModelInput } from './models/composite-model';

// Utilities
export * from './utils/distributions';
export * from './utils/interpolation';
export * from './utils/optimization';
export * from './utils/validation';
