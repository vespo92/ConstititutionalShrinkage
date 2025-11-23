import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getComplianceColor(score: number): string {
  if (score >= 80) return 'text-compliance-compliant';
  if (score >= 50) return 'text-compliance-warning';
  return 'text-compliance-violation';
}

export function getComplianceBgColor(score: number): string {
  if (score >= 80) return 'bg-compliance-compliant';
  if (score >= 50) return 'bg-compliance-warning';
  return 'bg-compliance-violation';
}

export function getSeverityColor(severity: 'minor' | 'major' | 'critical'): string {
  const colors = {
    minor: 'text-severity-minor',
    major: 'text-severity-major',
    critical: 'text-severity-critical',
  };
  return colors[severity];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
}

export function calculateComplianceScore(violations: { severity: string }[]): number {
  if (violations.length === 0) return 100;

  const weights = { minor: 5, major: 15, critical: 30 };
  const totalDeduction = violations.reduce((sum, v) => {
    return sum + (weights[v.severity as keyof typeof weights] || 10);
  }, 0);

  return Math.max(0, 100 - totalDeduction);
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortByDate<T extends { [key: string]: unknown }>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key] as string).getTime();
    const dateB = new Date(b[key] as string).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}
