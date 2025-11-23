import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type {
  Locale,
  Direction,
  TranslationNamespace,
  TranslationResource,
  TranslationValues,
  NestedTranslations,
} from '../types';
import { LOCALE_CONFIGS, DEFAULT_LOCALE, isValidLocale } from '../types';
import { interpolate } from '../utils/interpolate';
import { isPluralTranslation, formatPlural } from '../utils/plural';
import { detectLocale, cacheLocale } from '../utils/detector';

export interface I18nContextValue {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: TranslationValues) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  fallbackLocale?: Locale;
  resources: Record<Locale, TranslationResource>;
  defaultNamespace?: TranslationNamespace;
  autoDetect?: boolean;
  onLocaleChange?: (locale: Locale) => void;
}

/**
 * Provider for internationalization context
 */
export function I18nProvider({
  children,
  locale: initialLocale,
  fallbackLocale = DEFAULT_LOCALE,
  resources,
  defaultNamespace = 'common',
  autoDetect = true,
  onLocaleChange,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale && isValidLocale(initialLocale)) {
      return initialLocale;
    }
    if (autoDetect) {
      return detectLocale();
    }
    return fallbackLocale;
  });

  const direction = useMemo(() => LOCALE_CONFIGS[locale].direction, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!isValidLocale(newLocale)) {
        console.warn(`Invalid locale: ${newLocale}`);
        return;
      }
      setLocaleState(newLocale);
      cacheLocale(newLocale);
      onLocaleChange?.(newLocale);
    },
    [onLocaleChange]
  );

  // Update document attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', direction);
    }
  }, [locale, direction]);

  const getTranslation = useCallback(
    (key: string): string | null => {
      const parts = key.split('.');
      let namespace = defaultNamespace;
      let path = parts;

      // Check if first part is a namespace
      if (parts.length > 1 && resources[locale]?.[parts[0]]) {
        namespace = parts[0] as TranslationNamespace;
        path = parts.slice(1);
      }

      // Try current locale first
      let translations = resources[locale]?.[namespace] as NestedTranslations | undefined;
      if (!translations) {
        // Fall back to fallback locale
        translations = resources[fallbackLocale]?.[namespace] as NestedTranslations | undefined;
      }

      if (!translations) {
        return null;
      }

      // Navigate to the translation
      let value: unknown = translations;
      for (const part of path) {
        if (typeof value !== 'object' || value === null) {
          return null;
        }
        value = (value as Record<string, unknown>)[part];
      }

      if (typeof value === 'string') {
        return value;
      }

      if (isPluralTranslation(value)) {
        return value.other; // Will be handled by t() with count
      }

      return null;
    },
    [locale, fallbackLocale, resources, defaultNamespace]
  );

  const t = useCallback(
    (key: string, values: TranslationValues = {}): string => {
      const parts = key.split('.');
      let namespace = defaultNamespace;
      let path = parts;

      // Check if first part is a namespace
      if (parts.length > 1 && resources[locale]?.[parts[0]]) {
        namespace = parts[0] as TranslationNamespace;
        path = parts.slice(1);
      }

      // Get translations for current locale or fallback
      let translations = resources[locale]?.[namespace] as NestedTranslations | undefined;
      if (!translations) {
        translations = resources[fallbackLocale]?.[namespace] as NestedTranslations | undefined;
      }

      if (!translations) {
        console.warn(`Missing namespace: ${namespace}`);
        return key;
      }

      // Navigate to the translation
      let value: unknown = translations;
      for (const part of path) {
        if (typeof value !== 'object' || value === null) {
          console.warn(`Missing translation: ${key}`);
          return key;
        }
        value = (value as Record<string, unknown>)[part];
      }

      // Handle string translation
      if (typeof value === 'string') {
        return interpolate(value, values);
      }

      // Handle plural translation
      if (isPluralTranslation(value) && typeof values.count === 'number') {
        return interpolate(formatPlural(value, values.count, locale), values);
      }

      console.warn(`Invalid translation value for: ${key}`);
      return key;
    },
    [locale, fallbackLocale, resources, defaultNamespace]
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      const config = LOCALE_CONFIGS[locale];
      const formatOptions = options || config.dateFormat;
      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions): string => {
      const config = LOCALE_CONFIGS[locale];
      const formatOptions = options || config.numberFormat;
      return new Intl.NumberFormat(locale, formatOptions).format(number);
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (amount: number, currency?: string): string => {
      const config = LOCALE_CONFIGS[locale];
      const formatOptions = {
        ...config.currencyFormat,
        ...(currency && { currency }),
      };
      return new Intl.NumberFormat(locale, formatOptions).format(amount);
    },
    [locale]
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
    },
    [locale]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      locale,
      direction,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    }),
    [locale, direction, setLocale, t, formatDate, formatNumber, formatCurrency, formatRelativeTime]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access the i18n context
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export default I18nProvider;
