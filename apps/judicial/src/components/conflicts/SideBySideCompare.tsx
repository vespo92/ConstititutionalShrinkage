'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GitCompare, ArrowLeftRight } from 'lucide-react';
import type { ConflictingLaw } from '@/types';

interface SideBySideCompareProps {
  law1: ConflictingLaw;
  law2: ConflictingLaw;
  highlightDifferences?: boolean;
}

export function SideBySideCompare({ law1, law2, highlightDifferences = true }: SideBySideCompareProps) {
  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-judicial-primary" />
          <span>Side-by-Side Comparison</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-700">
          <div className="p-6">
            <div className="mb-4">
              <Badge variant="info" size="lg">Law 1</Badge>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-2">
                {law1.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {law1.section}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
              <p className="font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-slate-200">
                {law1.clause}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <Badge variant="warning" size="lg">Law 2</Badge>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mt-2">
                {law2.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {law2.section}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
              <p className="font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-slate-200">
                {law2.clause}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-compliance-warning/10 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <ArrowLeftRight className="h-5 w-5 text-compliance-warning" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Conflict Analysis
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            These two provisions contain contradictory requirements. Law 1 appears to mandate an action
            while Law 2 prohibits or restricts the same action. This conflict may create legal uncertainty
            and should be resolved to ensure consistent application of the law.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
