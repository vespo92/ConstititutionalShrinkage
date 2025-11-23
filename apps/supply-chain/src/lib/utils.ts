import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${formatNumber(km * 1000, 0)} m`;
  }
  if (km < 100) {
    return `${formatNumber(km, 1)} km`;
  }
  return `${formatNumber(km, 0)} km`;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(d);
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'score-excellent';
  if (score >= 60) return 'score-good';
  if (score >= 40) return 'score-moderate';
  if (score >= 20) return 'score-poor';
  return 'score-none';
}

export function getTierClass(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'local':
      return 'tier-local';
    case 'regional':
      return 'tier-regional';
    case 'national':
      return 'tier-national';
    case 'international':
      return 'tier-international';
    default:
      return 'tier-badge bg-slate-100 text-slate-800';
  }
}

export function getTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'local':
      return '#22c55e';
    case 'regional':
      return '#3b82f6';
    case 'national':
      return '#eab308';
    case 'international':
      return '#ef4444';
    default:
      return '#64748b';
  }
}

export function getNodeTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'producer':
      return '#10b981';
    case 'distributor':
      return '#6366f1';
    case 'retailer':
      return '#f59e0b';
    case 'consumer':
      return '#8b5cf6';
    default:
      return '#64748b';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
