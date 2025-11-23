import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Formatting Utilities
 * Common formatting functions for dates, numbers, and text
 */

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date with smart display (today, yesterday, or date)
 */
export function formatSmartDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format time remaining until deadline
 */
export function formatTimeRemaining(deadline: string | Date): string {
  const endDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a bill ID for display (short form)
 */
export function formatBillId(id: string): string {
  return `#${id.slice(0, 8)}`;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format vote count with label
 */
export function formatVoteCount(count: number, type: 'yea' | 'nay' | 'abstain'): string {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return `${formatNumber(count)} ${label}`;
}

/**
 * Format delegation weight
 */
export function formatWeight(weight: number): string {
  return `${weight}x`;
}
