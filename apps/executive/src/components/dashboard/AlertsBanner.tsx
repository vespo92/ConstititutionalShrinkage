'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, formatDateTime } from '@/lib/utils';
import type { Alert } from '@/types';

interface AlertsBannerProps {
  alerts: Alert[];
  onDismiss?: (alertId: string) => void;
}

const alertStyles: Record<Alert['type'], { bg: string; border: string; icon: React.ReactNode }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: (
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: (
      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function AlertsBanner({ alerts, onDismiss }: AlertsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((alert) => !dismissedIds.has(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedIds((prev) => new Set([...Array.from(prev), alertId]));
    onDismiss?.(alertId);
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => {
        const style = alertStyles[alert.type];
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border',
              style.bg,
              style.border
            )}
          >
            <div className="flex-shrink-0">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                <time className="text-xs text-gray-500">
                  {formatDateTime(alert.createdAt)}
                </time>
              </div>
              <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
              {alert.actionUrl && (
                <Link
                  href={alert.actionUrl}
                  className="mt-2 inline-flex text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Mock data for development
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Budget Review Required',
    message: 'Q2 budget allocation is due for review. Please complete the review before the deadline.',
    createdAt: new Date().toISOString(),
    read: false,
    actionUrl: '/resources/budget',
  },
  {
    id: '2',
    type: 'info',
    title: 'New Policy Guidelines',
    message: 'Updated policy implementation guidelines are now available. Review the changes.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
    actionUrl: '/policies',
  },
];

export default AlertsBanner;
