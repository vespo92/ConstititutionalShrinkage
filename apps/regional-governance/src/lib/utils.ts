import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import type { PodMetrics, TBLScore } from '@/types';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPopulation(population: number): string {
  return new Intl.NumberFormat('en-US').format(population);
}

export function calculateTBLOverall(score: Omit<TBLScore, 'overall'>): number {
  // Weighted average: People 40%, Planet 35%, Profit 25%
  return score.people * 0.4 + score.planet * 0.35 + score.profit * 0.25;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

export function getMetricColorValue(value: number, metric: keyof PodMetrics): string {
  // Returns a CSS color based on the metric value (0-100 scale)
  const hue = (value / 100) * 120; // 0 = red, 120 = green
  return `hsl(${hue}, 70%, 45%)`;
}

export function isVotingOpen(votingEnds?: Date): boolean {
  if (!votingEnds) return false;
  return isAfter(new Date(votingEnds), new Date());
}

export function getVotingTimeRemaining(votingEnds: Date): string {
  const end = new Date(votingEnds);
  if (isBefore(end, new Date())) {
    return 'Voting closed';
  }
  return `Ends ${formatDistanceToNow(end, { addSuffix: true })}`;
}

export function calculateVotePercentage(votes: { for: number; against: number; abstain: number }): {
  forPercent: number;
  againstPercent: number;
  abstainPercent: number;
} {
  const total = votes.for + votes.against + votes.abstain;
  if (total === 0) {
    return { forPercent: 0, againstPercent: 0, abstainPercent: 0 };
  }
  return {
    forPercent: Math.round((votes.for / total) * 100),
    againstPercent: Math.round((votes.against / total) * 100),
    abstainPercent: Math.round((votes.abstain / total) * 100),
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
