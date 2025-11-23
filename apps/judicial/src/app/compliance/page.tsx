'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComplianceScore, ComplianceBar } from '@/components/compliance/ComplianceScore';
import { ViolationCard } from '@/components/compliance/ViolationCard';
import { useCompliance } from '@/hooks/useCompliance';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CompliancePage() {
  const { violations, stats, fetchViolations, fetchStats, isLoading, criticalCount, majorCount } = useCompliance();

  useEffect(() => {
    fetchViolations();
    fetchStats();
  }, [fetchViolations, fetchStats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-7 w-7 text-judicial-primary" />
            Compliance Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Constitutional compliance monitoring and analytics
          </p>
        </div>
        <Link href="/compliance/check">
          <Button variant="primary">
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Compliance Check
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="text-center">
            <ComplianceScore score={stats.averageScore} size="md" />
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Average Score</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl font-bold text-judicial-primary">{stats.totalChecks}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Total Checks</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl font-bold text-compliance-compliant">{stats.compliantRate}%</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Compliant Rate</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <p className="text-4xl font-bold text-compliance-violation">{criticalCount}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Critical Violations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Violations by Category */}
        <Card variant="bordered" padding="none">
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-compliance-warning" />
              <span>Violations by Category</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.violationsByCategory).map(([category, count]) => {
                const percentage = Math.round((count / stats.totalChecks) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <ComplianceBar score={100 - percentage} height={6} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Trend Over Time */}
        <Card variant="bordered" padding="none">
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-judicial-primary" />
              <span>Compliance Trend</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.trendsOverTime.map((point, index) => (
                <div key={point.date} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-slate-400 w-24">
                    {point.date}
                  </span>
                  <div className="flex-1">
                    <ComplianceBar score={point.score} height={8} />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{point.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Violations
          </h2>
          <Link href="/compliance/violations" className="text-sm text-judicial-primary hover:underline">
            View all violations
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {violations.slice(0, 3).map((violation) => (
              <ViolationCard key={violation.id} violation={violation} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
