'use client';

import { cn, formatDate, getStatusColor, formatCurrency } from '@/lib/utils';
import type { PolicyImplementation, Milestone, AllocatedResource, Blocker } from '@/types';

interface ImplementationTrackerProps {
  implementation: PolicyImplementation;
}

export function ImplementationTracker({ implementation }: ImplementationTrackerProps) {
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Implementation Progress</h3>
          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getStatusColor(implementation.status))}>
            {implementation.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium text-gray-900">{implementation.progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${implementation.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(implementation.timeline.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Target Date</p>
            <p className="font-medium">{formatDate(implementation.timeline.targetDate)}</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Milestones</h3>
        <div className="space-y-4">
          {implementation.milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              isLast={index === implementation.milestones.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Allocated Resources */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Allocated Resources</h3>
        <div className="space-y-3">
          {implementation.resources.map((resource) => (
            <ResourceItem key={resource.id} resource={resource} />
          ))}
        </div>
      </div>

      {/* Blockers */}
      {implementation.blockers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Blockers
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
              {implementation.blockers.filter(b => b.status === 'open').length} open
            </span>
          </h3>
          <div className="space-y-3">
            {implementation.blockers.map((blocker) => (
              <BlockerItem key={blocker.id} blocker={blocker} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneItem({ milestone, isLast }: { milestone: Milestone; isLast: boolean }) {
  const statusIcons = {
    completed: (
      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    in_progress: (
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    ),
    not_started: (
      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-300" />
      </div>
    ),
    blocked: (
      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {statusIcons[milestone.status]}
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(milestone.status))}>
            {milestone.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Target: {formatDate(milestone.targetDate)}</span>
          {milestone.completedDate && (
            <span className="text-green-600">Completed: {formatDate(milestone.completedDate)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceItem({ resource }: { resource: AllocatedResource }) {
  const typeIcons: Record<string, React.ReactNode> = {
    budget: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    personnel: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    infrastructure: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    equipment: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{typeIcons[resource.type]}</div>
        <div>
          <p className="font-medium text-gray-900">{resource.resourceName}</p>
          <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">
          {resource.type === 'budget'
            ? formatCurrency(resource.amount)
            : `${resource.amount} ${resource.unit}`}
        </p>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(resource.status))}>
          {resource.status}
        </span>
      </div>
    </div>
  );
}

function BlockerItem({ blocker }: { blocker: Blocker }) {
  const severityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className={cn('p-3 rounded-lg border', blocker.status === 'resolved' ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200')}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-gray-900">{blocker.title}</h4>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', severityColors[blocker.severity])}>
            {blocker.severity}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(blocker.status))}>
            {blocker.status}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600">{blocker.description}</p>
      <p className="text-xs text-gray-500 mt-2">Reported: {formatDate(blocker.createdAt)}</p>
    </div>
  );
}

export default ImplementationTracker;
