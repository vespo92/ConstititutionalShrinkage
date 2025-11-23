'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'compliant' | 'warning' | 'violation' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200',
    compliant: 'bg-compliance-compliant/20 text-compliance-compliant',
    warning: 'bg-compliance-warning/20 text-compliance-warning',
    violation: 'bg-compliance-violation/20 text-compliance-violation',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-judicial-secondary/20 text-judicial-secondary',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center font-medium rounded-full', variantClasses[variant], sizeClasses[size], className)
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    in_review: { variant: 'info', label: 'In Review' },
    approved: { variant: 'compliant', label: 'Approved' },
    rejected: { variant: 'violation', label: 'Rejected' },
    compliant: { variant: 'compliant', label: 'Compliant' },
    warning: { variant: 'warning', label: 'Warning' },
    violation: { variant: 'violation', label: 'Violation' },
    filed: { variant: 'default', label: 'Filed' },
    assigned: { variant: 'info', label: 'Assigned' },
    hearing: { variant: 'secondary', label: 'In Hearing' },
    deliberation: { variant: 'warning', label: 'Deliberation' },
    ruled: { variant: 'compliant', label: 'Ruled' },
    requires_modification: { variant: 'warning', label: 'Needs Modification' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function SeverityBadge({ severity }: { severity: 'minor' | 'major' | 'critical' }) {
  const severityConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    minor: { variant: 'warning', label: 'Minor' },
    major: { variant: 'warning', label: 'Major' },
    critical: { variant: 'violation', label: 'Critical' },
  };

  return <Badge variant={severityConfig[severity].variant}>{severityConfig[severity].label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'urgent' }) {
  const priorityConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'info', label: 'Medium' },
    high: { variant: 'warning', label: 'High' },
    urgent: { variant: 'violation', label: 'Urgent' },
  };

  return <Badge variant={priorityConfig[priority].variant}>{priorityConfig[priority].label}</Badge>;
}
