'use client';

import Link from 'next/link';
import { formatDateTime, cn } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityFeedProps {
  activities: Activity[];
  showAll?: boolean;
}

const activityIcons: Record<Activity['type'], React.ReactNode> = {
  policy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  resource: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  metric: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  emergency: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const activityColors: Record<Activity['type'], string> = {
  policy: 'bg-blue-100 text-blue-600',
  resource: 'bg-purple-100 text-purple-600',
  metric: 'bg-green-100 text-green-600',
  emergency: 'bg-red-100 text-red-600',
  system: 'bg-gray-100 text-gray-600',
};

export function ActivityFeed({ activities, showAll = false }: ActivityFeedProps) {
  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {displayedActivities.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No recent activity
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', activityColors[activity.type])}>
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <time className="text-xs text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </time>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">by {activity.userName}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!showAll && activities.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Link href="/activity" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all activity
          </Link>
        </div>
      )}
    </div>
  );
}

// Mock data for development
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'policy',
    action: 'Policy Updated',
    description: 'Healthcare Access Initiative progress updated to 45%',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    type: 'resource',
    action: 'Budget Allocated',
    description: '$2.5M allocated to Green Energy Program',
    userId: 'user-2',
    userName: 'Michael Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: '3',
    type: 'metric',
    action: 'Metrics Updated',
    description: 'Q1 TBL scores published for Pacific Northwest',
    userId: 'user-3',
    userName: 'Emily Rodriguez',
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: '4',
    type: 'emergency',
    action: 'Alert Resolved',
    description: 'Weather advisory lifted for coastal regions',
    userId: 'user-4',
    userName: 'David Kim',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: '5',
    type: 'policy',
    action: 'New Policy Created',
    description: 'Public Education Enhancement draft submitted',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export default ActivityFeed;
