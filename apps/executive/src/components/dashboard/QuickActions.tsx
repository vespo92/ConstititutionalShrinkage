'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Create Policy',
    description: 'Start a new policy implementation',
    href: '/policies/create',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Allocate Resources',
    description: 'Distribute budget or personnel',
    href: '/resources/allocate',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    name: 'View Metrics',
    description: 'Check TBL performance scores',
    href: '/metrics',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Generate Report',
    description: 'Create performance reports',
    href: '/metrics/reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'bg-orange-500 hover:bg-orange-600',
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 transition-colors',
                action.color
              )}
            >
              {action.icon}
            </div>
            <h4 className="text-sm font-medium text-gray-900 text-center">
              {action.name}
            </h4>
            <p className="text-xs text-gray-500 text-center mt-1">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
