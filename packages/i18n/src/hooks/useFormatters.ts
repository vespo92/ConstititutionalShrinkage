import { useMemo, useCallback } from 'react';
import { useI18n } from '../provider/I18nProvider';

export interface UseFormattersReturn {
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatPercent: (value: number, decimals?: number) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  formatList: (items: string[], style?: 'conjunction' | 'disjunction' | 'unit') => string;
}

/**
 * Hook for formatting utilities
 */
export function useFormatters(): UseFormattersReturn {
  const { locale, formatDate, formatNumber, formatCurrency, formatRelativeTime } = useI18n();

  const formatTime = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        ...options,
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    },
    [locale]
  );

  const formatDateTime = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        ...options,
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    },
    [locale]
  );

  const formatPercent = useCallback(
    (value: number, decimals: number = 0): string => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    },
    [locale]
  );

  const formatList = useCallback(
    (items: string[], style: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'): string => {
      return new Intl.ListFormat(locale, { style, type: style }).format(items);
    },
    [locale]
  );

  return useMemo(
    () => ({
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatCurrency,
      formatPercent,
      formatRelativeTime,
      formatList,
    }),
    [
      formatDate,
      formatTime,
      formatDateTime,
      formatNumber,
      formatCurrency,
      formatPercent,
      formatRelativeTime,
      formatList,
    ]
  );
}

export default useFormatters;
