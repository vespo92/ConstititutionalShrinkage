import { useMemo } from 'react';
import { useI18n } from '../provider/I18nProvider';
import { LOCALE_CONFIGS, SUPPORTED_LOCALES, type Locale, type LocaleConfig } from '../types';

export interface UseLocaleReturn {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  localeConfig: LocaleConfig;
  supportedLocales: Locale[];
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
}

/**
 * Hook for locale information and formatting utilities
 */
export function useLocale(): UseLocaleReturn {
  const {
    locale,
    setLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  } = useI18n();

  const localeConfig = useMemo(() => LOCALE_CONFIGS[locale], [locale]);

  return useMemo(
    () => ({
      locale,
      setLocale,
      localeConfig,
      supportedLocales: SUPPORTED_LOCALES,
      formatDate,
      formatNumber,
      formatCurrency,
      formatRelativeTime,
    }),
    [locale, setLocale, localeConfig, formatDate, formatNumber, formatCurrency, formatRelativeTime]
  );
}

export default useLocale;
