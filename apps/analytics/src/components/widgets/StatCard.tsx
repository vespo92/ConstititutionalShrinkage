'use client';

import { clsx } from 'clsx';
import {
  Users,
  FileText,
  Vote,
  Activity,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: 'users' | 'file-text' | 'vote' | 'activity';
  loading?: boolean;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'file-text': FileText,
  'vote': Vote,
  'activity': Activity,
};

export function StatCard({
  title,
  value,
  change,
  icon = 'activity',
  loading = false,
  className,
}: StatCardProps) {
  const Icon = iconMap[icon] || Activity;

  if (loading) {
    return (
      <div className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
        className
      )}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
      'hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </span>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change !== undefined && (
          <div className={clsx(
            'flex items-center mt-2 text-sm',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
