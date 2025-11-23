'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RightsCheck } from '@/types';

interface RightsImpactProps {
  rights: RightsCheck[];
}

export function RightsImpact({ rights }: RightsImpactProps) {
  const groupedRights = rights.reduce((acc, right) => {
    if (!acc[right.category]) {
      acc[right.category] = [];
    }
    acc[right.category].push(right);
    return acc;
  }, {} as Record<string, RightsCheck[]>);

  const getImpactIcon = (impact: number) => {
    if (impact > 10) return <TrendingUp className="h-4 w-4 text-compliance-compliant" />;
    if (impact < -10) return <TrendingDown className="h-4 w-4 text-compliance-violation" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 10) return 'text-compliance-compliant';
    if (impact < -10) return 'text-compliance-violation';
    return 'text-gray-500';
  };

  const categoryLabels: Record<string, string> = {
    fundamental: 'Fundamental Rights',
    procedural: 'Procedural Rights',
    economic: 'Economic Rights',
  };

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-judicial-secondary" />
          <span>Rights Impact Assessment</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {Object.entries(groupedRights).map(([category, categoryRights]) => (
          <div key={category} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {categoryLabels[category] || category}
              </h4>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {categoryRights.map((right) => (
                <div
                  key={right.rightId}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {getImpactIcon(right.impact)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {right.rightName}
                      </p>
                      <p className={`text-xs ${getImpactColor(right.impact)}`}>
                        Impact: {right.impact > 0 ? '+' : ''}{right.impact}%
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      right.status === 'protected' ? 'compliant' :
                      right.status === 'at_risk' ? 'warning' : 'violation'
                    }
                  >
                    {right.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}

        {rights.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
            No rights impact data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
