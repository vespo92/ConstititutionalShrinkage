import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Policy status
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',

    // Implementation status
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    blocked: 'bg-red-100 text-red-800',

    // Emergency levels
    advisory: 'bg-blue-100 text-blue-800',
    watch: 'bg-yellow-100 text-yellow-800',
    warning: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900',

    // Incident status
    monitoring: 'bg-yellow-100 text-yellow-800',
    contained: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',

    // Default
    default: 'bg-gray-100 text-gray-800',
  };

  return colors[status] || colors.default;
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable', inverted = false): string {
  if (inverted) {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      case 'stable':
        return 'text-gray-600';
    }
  }

  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
  }
}

export function getTBLCategoryColor(category: 'people' | 'planet' | 'profit'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'people':
      return {
        bg: 'bg-tbl-people-light',
        text: 'text-tbl-people-dark',
        border: 'border-tbl-people',
      };
    case 'planet':
      return {
        bg: 'bg-tbl-planet-light',
        text: 'text-tbl-planet-dark',
        border: 'border-tbl-planet',
      };
    case 'profit':
      return {
        bg: 'bg-tbl-profit-light',
        text: 'text-tbl-profit-dark',
        border: 'border-tbl-profit',
      };
  }
}

export function getScoreGrade(score: number): {
  grade: string;
  color: string;
} {
  if (score >= 90) return { grade: 'A', color: 'text-green-600' };
  if (score >= 80) return { grade: 'B', color: 'text-green-500' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-500' };
  return { grade: 'F', color: 'text-red-600' };
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
