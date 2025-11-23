export {
  interpolate,
  hasInterpolation,
  extractVariables,
  validateInterpolation,
} from './interpolate';

export {
  getPluralCategory,
  selectPlural,
  isPluralTranslation,
  formatPlural,
  type PluralCategory,
} from './plural';

export {
  detectLocale,
  cacheLocale,
  type DetectorOptions,
  type DetectionSource,
  type CacheType,
} from './detector';
