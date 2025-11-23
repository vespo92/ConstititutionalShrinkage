'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/Badge';
import { AlertTriangle, Lightbulb, FileText } from 'lucide-react';
import type { Violation } from '@/types';

interface ViolationCardProps {
  violation: Violation;
  expanded?: boolean;
}

export function ViolationCard({ violation, expanded = true }: ViolationCardProps) {
  const severityColors = {
    minor: 'border-l-severity-minor',
    major: 'border-l-severity-major',
    critical: 'border-l-severity-critical',
  };

  return (
    <Card variant="bordered" padding="none" className={`border-l-4 ${severityColors[violation.severity]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
              violation.severity === 'critical' ? 'text-severity-critical' :
              violation.severity === 'major' ? 'text-severity-major' : 'text-severity-minor'
            }`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {violation.rightName}
                </h4>
                <SeverityBadge severity={violation.severity} />
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                {violation.explanation}
              </p>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 ml-8">
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700 dark:text-slate-300">Clause Reference</p>
                <p className="text-gray-600 dark:text-slate-400 font-mono text-xs">
                  {violation.clause}
                </p>
              </div>
            </div>

            {violation.remediation && (
              <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-judicial-primary/5 dark:bg-judicial-primary/10">
                <Lightbulb className="h-4 w-4 text-judicial-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-judicial-primary">Suggested Remediation</p>
                  <p className="text-gray-600 dark:text-slate-400">
                    {violation.remediation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
