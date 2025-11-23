'use client';

import Link from 'next/link';
import { cn, formatDate, getStatusColor, getProgressColor, formatPercentage } from '@/lib/utils';
import type { Policy } from '@/types';

interface PolicyCardProps {
  policy: Policy;
  showProgress?: boolean;
}

export function PolicyCard({ policy, showProgress = true }: PolicyCardProps) {
  return (
    <Link href={`/policies/${policy.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{policy.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{policy.regionName}</p>
          </div>
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(policy.status))}>
            {policy.status.replace('_', ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{policy.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Category: {policy.category}</span>
          <span>Target: {formatDate(policy.targetDate)}</span>
        </div>

        {showProgress && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{policy.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', getProgressColor(policy.progress))}
                style={{ width: `${policy.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

interface PolicyListProps {
  policies: Policy[];
  view?: 'grid' | 'list';
}

export function PolicyList({ policies, view = 'grid' }: PolicyListProps) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {policies.map((policy) => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {policies.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} />
      ))}
    </div>
  );
}

export default PolicyCard;
