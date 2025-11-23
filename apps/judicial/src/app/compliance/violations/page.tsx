'use client';

import { useEffect, useState } from 'react';
import { ViolationCard } from '@/components/compliance/ViolationCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCompliance } from '@/hooks/useCompliance';
import { AlertTriangle, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ViolationsPage() {
  const { violations, fetchViolations, isLoading, criticalCount, majorCount } = useCompliance();
  const [severityFilter, setSeverityFilter] = useState<string>('');

  useEffect(() => {
    fetchViolations(severityFilter ? { severity: severityFilter } : undefined);
  }, [fetchViolations, severityFilter]);

  const filters = [
    { value: '', label: 'All', count: violations.length },
    { value: 'critical', label: 'Critical', count: criticalCount },
    { value: 'major', label: 'Major', count: majorCount },
    { value: 'minor', label: 'Minor', count: violations.filter(v => v.severity === 'minor').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/compliance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-compliance-violation" />
            All Violations
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Constitutional violations across all reviewed bills
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-slate-400">Filter by severity:</span>
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={severityFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter(filter.value)}
            >
              {filter.label}
              <Badge variant="default" size="sm" className="ml-2">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
        </div>
      ) : violations.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              No violations found for the selected filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {violations.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} expanded />
          ))}
        </div>
      )}
    </div>
  );
}
