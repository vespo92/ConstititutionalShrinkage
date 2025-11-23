'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Gavel, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Case } from '@/types';

interface CaseCardProps {
  caseData: Case;
  compact?: boolean;
}

export function CaseCard({ caseData, compact = false }: CaseCardProps) {
  const typeColors: Record<string, string> = {
    dispute: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    appeal: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    interpretation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  if (compact) {
    return (
      <Link href={`/cases/${caseData.id}`}>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-judicial-primary transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[caseData.type]}`}>
              {caseData.type}
            </span>
            <StatusBadge status={caseData.status} />
          </div>
          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {caseData.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {caseData.id}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Card variant="bordered" padding="none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[caseData.type]}`}>
                {caseData.type}
              </span>
              <StatusBadge status={caseData.status} />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {caseData.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {caseData.id}
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 line-clamp-2">
              {caseData.description}
            </p>
          </div>
          <Link href={`/cases/${caseData.id}`}>
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Filed</p>
              <p className="font-medium">{formatDate(caseData.filedDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Parties</p>
              <p className="font-medium">{caseData.parties.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Judge</p>
              <p className="font-medium">{caseData.assignedJudge || 'Unassigned'}</p>
            </div>
          </div>
        </div>

        {caseData.parties.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Parties
            </p>
            <div className="flex flex-wrap gap-2">
              {caseData.parties.map((party) => (
                <Badge key={party.id} variant={party.role === 'plaintiff' ? 'info' : 'default'}>
                  {party.name} ({party.role})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
