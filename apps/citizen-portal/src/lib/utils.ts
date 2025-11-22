/**
 * Utility functions for the Citizen Portal
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number for display (e.g., 1,234,567 -> 1.2M)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return formatDate(d);
}

/**
 * Get time remaining string (e.g., "3 days left")
 */
export function getTimeRemaining(endDate: Date | string): string {
  const d = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const seconds = Math.floor((d.getTime() - Date.now()) / 1000);

  if (seconds < 0) return 'Ended';
  if (seconds < 60) return 'Less than a minute';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes left`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours left`;
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} left`;
  }
  return formatDate(d);
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if voting ends within the specified hours
 */
export function isUrgent(endDate: Date | string, hoursThreshold = 24): boolean {
  const d = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const hoursRemaining = (d.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursRemaining > 0 && hoursRemaining <= hoursThreshold;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a cryptographic proof for display
 */
export function formatCryptoProof(proof: string): string {
  if (proof.length <= 12) return proof;
  return `${proof.slice(0, 8)}...${proof.slice(-4)}`;
}

/**
 * Get color class based on vote choice
 */
export function getVoteColorClass(choice: 'for' | 'against' | 'abstain'): string {
  const colors = {
    for: 'text-governance-civic bg-governance-civic/10',
    against: 'text-governance-alert bg-governance-alert/10',
    abstain: 'text-gray-500 bg-gray-100 dark:bg-slate-700',
  };
  return colors[choice];
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(
  status: 'draft' | 'voting' | 'passed' | 'failed' | 'vetoed'
): string {
  const classes = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300',
    voting: 'bg-governance-vote/10 text-governance-vote',
    passed: 'bg-governance-civic/10 text-governance-civic',
    failed: 'bg-governance-alert/10 text-governance-alert',
    vetoed: 'bg-governance-delegate/10 text-governance-delegate',
  };
  return classes[status];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a URL with query parameters
 */
export function createUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
