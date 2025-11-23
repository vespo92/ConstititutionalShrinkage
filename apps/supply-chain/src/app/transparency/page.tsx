'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Award, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useTransparency } from '@/hooks/useTransparency';
import { cn, getScoreColor } from '@/lib/utils';
import type { OrganizationRanking } from '@/types';

export default function TransparencyPage() {
  const { rankings, fetchRankings, isLoading, getScoreLevel, getScoreDescription } = useTransparency();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRankings({ limit: 10 });
  }, [fetchRankings]);

  const filteredRankings = searchQuery
    ? rankings.filter(r =>
        r.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.industry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rankings;

  const columns: Column<OrganizationRanking>[] = [
    {
      key: 'rank',
      header: '#',
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-white">{item.rank}</span>
      ),
      className: 'w-12',
    },
    {
      key: 'organizationName',
      header: 'Organization',
      render: (item) => (
        <div>
          <Link href={`/transparency/${item.organizationId}`} className="font-medium text-slate-900 dark:text-white hover:text-primary-600">
            {item.organizationName}
          </Link>
          <p className="text-sm text-slate-500">{item.industry}</p>
        </div>
      ),
    },
    {
      key: 'transparencyScore',
      header: 'Score',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full')}
              style={{
                width: `${item.transparencyScore}%`,
                backgroundColor: item.transparencyScore >= 80 ? '#22c55e' :
                               item.transparencyScore >= 60 ? '#84cc16' :
                               item.transparencyScore >= 40 ? '#eab308' : '#ef4444'
              }}
            />
          </div>
          <span className={cn('font-semibold', getScoreColor(item.transparencyScore))}>
            {item.transparencyScore}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'change',
      header: 'Change',
      render: (item) => (
        <span className={cn(
          'font-medium',
          item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-slate-500'
        )}>
          {item.change > 0 ? '+' : ''}{item.change}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'badges',
      header: 'Badges',
      render: (item) => (
        <div className="flex gap-1">
          {item.badges.slice(0, 2).map(badge => (
            <span
              key={badge.id}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                badge.level === 'platinum' ? 'bg-slate-200 text-slate-800' :
                badge.level === 'gold' ? 'bg-amber-100 text-amber-800' :
                badge.level === 'silver' ? 'bg-slate-100 text-slate-600' :
                'bg-orange-100 text-orange-800'
              )}
              title={badge.description}
            >
              {badge.name}
            </span>
          ))}
          {item.badges.length > 2 && (
            <span className="text-xs text-slate-500">+{item.badges.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <Link href={`/transparency/${item.organizationId}`}>
          <Button variant="ghost" size="sm">
            View <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      ),
      className: 'w-24',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transparency Reports
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Business transparency scores and supply chain disclosure
          </p>
        </div>
        <Link href="/transparency/rankings">
          <Button variant="outline" leftIcon={<Award className="h-4 w-4" />}>
            View Full Rankings
          </Button>
        </Link>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">85+</p>
            <p className="text-sm text-slate-500">Excellent</p>
            <p className="text-xs text-slate-400 mt-1">Full disclosure</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Shield className="h-8 w-8 text-lime-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">60-84</p>
            <p className="text-sm text-slate-500">Good</p>
            <p className="text-xs text-slate-400 mt-1">Mostly transparent</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">40-59</p>
            <p className="text-sm text-slate-500">Moderate</p>
            <p className="text-xs text-slate-400 mt-1">Some gaps</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Shield className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">&lt;40</p>
            <p className="text-sm text-slate-500">Needs Improvement</p>
            <p className="text-xs text-slate-400 mt-1">Limited disclosure</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Rankings */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Transparent Organizations
          </CardTitle>
          <div className="w-full sm:w-64">
            <SearchBar
              placeholder="Search organizations..."
              onSearch={setSearchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
            </div>
          ) : (
            <DataTable
              data={filteredRankings}
              columns={columns}
              keyExtractor={(item) => item.organizationId}
              emptyMessage="No organizations found"
            />
          )}
        </CardBody>
      </Card>

      {/* How Scores Are Calculated */}
      <Card>
        <CardHeader>
          <CardTitle>How Transparency Scores Work</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold text-sm">
                  30%
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">Supply Chain</h4>
              </div>
              <p className="text-sm text-slate-500">
                Disclosure of suppliers, distances, and sourcing practices
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                  25%
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">Employment</h4>
              </div>
              <p className="text-sm text-slate-500">
                Wages, benefits, working conditions, and safety records
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 font-bold text-sm">
                  25%
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">Environmental</h4>
              </div>
              <p className="text-sm text-slate-500">
                Emissions, waste management, and sustainability practices
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-bold text-sm">
                  20%
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">Disclosure</h4>
              </div>
              <p className="text-sm text-slate-500">
                Public reporting, audit compliance, and data accessibility
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
