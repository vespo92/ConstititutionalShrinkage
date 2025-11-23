'use client';

import { formatDateTime } from '@/lib/utils';
import { FileText, Users, Calendar, Gavel, MessageSquare, Upload } from 'lucide-react';
import type { Case, Evidence, Hearing } from '@/types';

interface TimelineEvent {
  id: string;
  type: 'filed' | 'evidence' | 'hearing' | 'ruling' | 'update';
  title: string;
  description?: string;
  date: Date;
  icon: typeof FileText;
  iconColor: string;
}

interface CaseTimelineProps {
  caseData: Case;
}

export function CaseTimeline({ caseData }: CaseTimelineProps) {
  const events: TimelineEvent[] = [];

  // Case filed event
  events.push({
    id: 'filed',
    type: 'filed',
    title: 'Case Filed',
    description: `${caseData.type.charAt(0).toUpperCase() + caseData.type.slice(1)} case filed`,
    date: caseData.filedDate,
    icon: FileText,
    iconColor: 'bg-blue-500',
  });

  // Evidence events
  caseData.evidence.forEach((ev: Evidence) => {
    events.push({
      id: ev.id,
      type: 'evidence',
      title: `Evidence Submitted: ${ev.title}`,
      description: ev.description,
      date: ev.uploadedAt,
      icon: Upload,
      iconColor: 'bg-purple-500',
    });
  });

  // Hearing events
  caseData.hearings.forEach((hearing: Hearing) => {
    events.push({
      id: hearing.id,
      type: 'hearing',
      title: `${hearing.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Hearing`,
      description: `Location: ${hearing.location} - Status: ${hearing.status}`,
      date: hearing.scheduledAt,
      icon: Calendar,
      iconColor: 'bg-amber-500',
    });
  });

  // Ruling event
  if (caseData.ruling) {
    events.push({
      id: caseData.ruling.id,
      type: 'ruling',
      title: 'Ruling Issued',
      description: caseData.ruling.summary,
      date: caseData.ruling.issuedAt,
      icon: Gavel,
      iconColor: 'bg-green-500',
    });
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const Icon = event.icon;
          const isLast = idx === events.length - 1;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${event.iconColor} flex items-center justify-center ring-4 ring-white dark:ring-slate-900`}>
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {formatDateTime(event.date)}
                      </p>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
