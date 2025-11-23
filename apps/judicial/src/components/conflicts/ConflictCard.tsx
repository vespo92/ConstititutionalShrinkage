'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge, SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { GitCompare, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { LegislativeConflict } from '@/types';

interface ConflictCardProps {
  conflict: LegislativeConflict;
}

export function ConflictCard({ conflict }: ConflictCardProps) {
  return (
    <Card variant="bordered" padding="none" className="border-l-4 border-l-compliance-warning">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-compliance-warning" />
              <StatusBadge status={conflict.status} />
              <Badge
                variant={
                  conflict.severity === 'severe' ? 'violation' :
                  conflict.severity === 'moderate' ? 'warning' : 'default'
                }
              >
                {conflict.severity}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {conflict.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              {conflict.description}
            </p>
          </div>
          <Link href={`/conflicts/${conflict.id}`}>
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Conflicting Laws ({conflict.conflictingLaws.length})
          </p>
          <div className="space-y-2">
            {conflict.conflictingLaws.map((law, index) => (
              <div
                key={law.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-judicial-primary text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {law.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {law.section} • Effective: {formatDate(law.effectiveDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Detected: {formatDate(conflict.detectedAt)}</span>
          {conflict.resolvedAt && (
            <span>Resolved: {formatDate(conflict.resolvedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
