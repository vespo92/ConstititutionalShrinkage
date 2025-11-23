'use client';

import Link from 'next/link';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
import type { Incident } from '@/types';

interface EmergencyPanelProps {
  incidents: Incident[];
  showAll?: boolean;
}

const levelColors: Record<Incident['level'], { bg: string; text: string; dot: string }> = {
  advisory: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  watch: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  warning: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  emergency: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600 animate-pulse' },
};

export function EmergencyPanel({ incidents, showAll = false }: EmergencyPanelProps) {
  const activeIncidents = incidents.filter((i) => i.status === 'active' || i.status === 'monitoring');
  const displayedIncidents = showAll ? incidents : activeIncidents.slice(0, 5);
  const hasActiveEmergencies = activeIncidents.some((i) => i.level === 'emergency' || i.level === 'critical');

  return (
    <div className={cn(
      'rounded-lg border',
      hasActiveEmergencies ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
    )}>
      <div className={cn(
        'px-4 py-3 border-b flex items-center justify-between',
        hasActiveEmergencies ? 'border-red-200' : 'border-gray-200'
      )}>
        <div className="flex items-center gap-2">
          <svg className={cn('w-5 h-5', hasActiveEmergencies ? 'text-red-600' : 'text-gray-500')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className={cn('font-semibold', hasActiveEmergencies ? 'text-red-900' : 'text-gray-900')}>
            Emergency Status
          </h3>
        </div>
        {activeIncidents.length > 0 && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            hasActiveEmergencies ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
          )}>
            {activeIncidents.length} active
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {displayedIncidents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No active emergencies</p>
            <p className="text-sm text-gray-400">All systems operating normally</p>
          </div>
        ) : (
          displayedIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}
      </div>

      {!showAll && incidents.length > 5 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <Link href="/emergency" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all incidents ({incidents.length})
          </Link>
        </div>
      )}
    </div>
  );
}

interface IncidentCardProps {
  incident: Incident;
  detailed?: boolean;
}

export function IncidentCard({ incident, detailed = false }: IncidentCardProps) {
  const levelStyle = levelColors[incident.level];

  return (
    <Link href={`/emergency/incidents/${incident.id}`}>
      <div className={cn(
        'px-4 py-3 hover:bg-gray-50 transition-colors',
        incident.level === 'critical' && 'bg-red-50 hover:bg-red-100'
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className={cn('w-3 h-3 rounded-full', levelStyle.dot)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">{incident.title}</h4>
              <span className={cn('flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full', levelStyle.bg, levelStyle.text)}>
                {incident.level}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{incident.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{incident.location}</span>
              <span>{formatDateTime(incident.reportedAt)}</span>
              <span className={cn('px-1.5 py-0.5 rounded', getStatusColor(incident.status))}>
                {incident.status}
              </span>
            </div>

            {detailed && (
              <div className="mt-3 flex items-center gap-4 text-xs">
                <span className="text-gray-500">
                  Affected: {incident.affectedPopulation.toLocaleString()} people
                </span>
                <span className="text-gray-500">
                  Resources: {incident.resources.length} allocated
                </span>
                <span className="text-gray-500">
                  Coordinators: {incident.coordinators.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Mock data
export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    title: 'Severe Weather Warning - Coastal Regions',
    description: 'Storm system approaching Pacific Northwest coastline. High winds and flooding expected.',
    level: 'warning',
    status: 'monitoring',
    type: 'weather',
    location: 'Pacific Northwest Coast',
    regionId: 'reg-1',
    reportedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date().toISOString(),
    affectedPopulation: 125000,
    resources: [],
    coordinators: [],
  },
  {
    id: 'inc-2',
    title: 'Infrastructure Maintenance - Power Grid',
    description: 'Scheduled maintenance on regional power infrastructure. Brief outages expected.',
    level: 'advisory',
    status: 'active',
    type: 'infrastructure',
    location: 'Metro Area Grid Section 4',
    regionId: 'reg-1',
    reportedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date().toISOString(),
    affectedPopulation: 45000,
    resources: [],
    coordinators: [],
  },
];

export default EmergencyPanel;
