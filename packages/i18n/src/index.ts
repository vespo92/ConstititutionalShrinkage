// Provider
export { I18nProvider, useI18n, type I18nContextValue, type I18nProviderProps } from './provider/I18nProvider';

// Hooks
export {
  useTranslation,
  useLocale,
  useFormatters,
  useDirection,
  getLogicalProperties,
  type UseTranslationReturn,
  type UseLocaleReturn,
  type UseFormattersReturn,
  type UseDirectionReturn,
} from './hooks';

// Utils
export {
  interpolate,
  hasInterpolation,
  extractVariables,
  validateInterpolation,
  getPluralCategory,
  selectPlural,
  isPluralTranslation,
  formatPlural,
  detectLocale,
  cacheLocale,
  type PluralCategory,
  type DetectorOptions,
  type DetectionSource,
  type CacheType,
} from './utils';

// Types
export {
  LOCALE_CONFIGS,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
  type Direction,
  type TranslationNamespace,
  type TranslationValues,
  type PluralTranslation,
  type TranslationValue,
  type NestedTranslations,
  type TranslationResource,
  type LocaleConfig,
} from './types';
