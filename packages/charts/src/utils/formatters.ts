/**
 * Formatting utilities for chart labels and tooltips
 */

export type NumberFormat = 'number' | 'percent' | 'currency' | 'compact' | 'decimal';

/**
 * Format a number for display
 */
export function formatNumber(
  value: number,
  format: NumberFormat = 'number',
  options: Intl.NumberFormatOptions = {}
): string {
  switch (format) {
    case 'percent':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        ...options,
      }).format(value / 100);

    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options,
      }).format(value);

    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
        ...options,
      }).format(value);

    case 'decimal':
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      }).format(value);

    default:
      return new Intl.NumberFormat('en-US', options).format(value);
  }
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date for chart axis
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'monthDay' | 'time' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

    case 'medium':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'monthDay':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format tick values for axis
 */
export function formatAxisTick(value: number, unit?: string): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B${unit || ''}`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M${unit || ''}`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K${unit || ''}`;
  }
  return `${value}${unit || ''}`;
}
