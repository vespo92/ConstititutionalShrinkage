/**
 * Formatting utilities for analytics display
 */

export type NumberFormat = 'number' | 'percent' | 'currency' | 'compact' | 'decimal';

/**
 * Format a number based on type
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
 * Format a number as compact (K, M, B)
 */
export function formatCompact(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

/**
 * Format a percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
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

    case 'relative':
      return formatRelativeTime(d);

    default:
      return d.toLocaleDateString();
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(date, 'short');
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format a TBL score with color
 */
export function getTBLScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Format change indicator
 */
export function formatChange(value: number): {
  text: string;
  color: string;
  icon: 'up' | 'down' | 'neutral';
} {
  if (value > 0) {
    return {
      text: `+${value.toFixed(1)}%`,
      color: 'text-green-600',
      icon: 'up',
    };
  }
  if (value < 0) {
    return {
      text: `${value.toFixed(1)}%`,
      color: 'text-red-600',
      icon: 'down',
    };
  }
  return {
    text: '0%',
    color: 'text-gray-500',
    icon: 'neutral',
  };
}
