'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComplianceScore } from '@/components/compliance/ComplianceScore';
import { ReviewQueue } from '@/components/review/ReviewQueue';
import { CaseCard } from '@/components/cases/CaseCard';
import { useReview } from '@/hooks/useReview';
import { useCases } from '@/hooks/useCases';
import { useCompliance } from '@/hooks/useCompliance';
import {
  FileCheck,
  Gavel,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { reviews, fetchReviews, pendingCount, urgentCount } = useReview();
  const { cases, fetchCases, activeCasesCount } = useCases();
  const { stats, fetchStats } = useCompliance();

  useEffect(() => {
    fetchReviews();
    fetchCases();
    fetchStats();
  }, [fetchReviews, fetchCases, fetchStats]);

  const statsCards = [
    {
      title: 'Pending Reviews',
      value: pendingCount,
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/review',
    },
    {
      title: 'Active Cases',
      value: activeCasesCount,
      icon: Gavel,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/cases',
    },
    {
      title: 'Urgent Items',
      value: urgentCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      href: '/review?priority=urgent',
    },
    {
      title: 'Compliance Rate',
      value: `${stats.compliantRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      href: '/compliance',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Judicial Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Constitutional review and case management overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          Last updated: Just now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card variant="bordered" className="hover:border-judicial-primary transition-colors">
                <CardContent className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compliance Overview */}
        <Card variant="bordered" padding="none">
          <CardHeader className="px-6 py-4">
            <span>Compliance Overview</span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              <ComplianceScore score={stats.averageScore} size="lg" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Total Checks</span>
                <span className="font-medium">{stats.totalChecks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Compliant Rate</span>
                <span className="font-medium text-compliance-compliant">{stats.compliantRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Average Score</span>
                <span className="font-medium">{stats.averageScore}</span>
              </div>
            </div>
            <Link
              href="/compliance"
              className="mt-4 block text-center text-sm text-judicial-primary hover:underline"
            >
              View detailed compliance report
            </Link>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <div className="lg:col-span-2">
          <ReviewQueue reviews={reviews.filter(r => r.status === 'pending').slice(0, 5)} />
        </div>
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Cases
          </h2>
          <Link href="/cases" className="text-sm text-judicial-primary hover:underline">
            View all cases
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.slice(0, 3).map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} compact />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <span>Quick Actions</span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/review"
              className="flex items-center gap-3 p-4 rounded-lg bg-judicial-primary/10 hover:bg-judicial-primary/20 transition-colors"
            >
              <FileCheck className="h-5 w-5 text-judicial-primary" />
              <span className="font-medium text-judicial-primary">Start Review</span>
            </Link>
            <Link
              href="/cases/new"
              className="flex items-center gap-3 p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Gavel className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-600">File New Case</span>
            </Link>
            <Link
              href="/compliance/check"
              className="flex items-center gap-3 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">Check Compliance</span>
            </Link>
            <Link
              href="/precedents"
              className="flex items-center gap-3 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-600">Search Precedents</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
