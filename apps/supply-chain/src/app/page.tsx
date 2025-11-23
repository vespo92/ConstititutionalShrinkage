'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Network,
  TrendingDown,
  DollarSign,
  Shield,
  ArrowRight,
  Package,
  MapPin,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/Button';
import { mockData } from '@/lib/api';
import { cn, getScoreColor } from '@/lib/utils';
import type { DashboardMetrics, TopProducer } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topProducers, setTopProducers] = useState<TopProducer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load mock data
    setMetrics(mockData.getDashboardMetrics());
    setTopProducers(mockData.getTopProducers());
    setIsLoading(false);
  }, []);

  const producerColumns: Column<TopProducer>[] = [
    {
      key: 'name',
      header: 'Producer',
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-sm text-slate-500">{item.region}</p>
        </div>
      ),
    },
    {
      key: 'transparencyScore',
      header: 'Transparency',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', getScoreColor(item.transparencyScore).replace('score-', 'bg-transparency-'))}
              style={{ width: `${item.transparencyScore}%` }}
            />
          </div>
          <span className={cn('text-sm font-medium', getScoreColor(item.transparencyScore))}>
            {item.transparencyScore}%
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'avgDistance',
      header: 'Avg Distance',
      render: (item) => (
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          item.avgDistance < 50 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
          item.avgDistance < 200 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
          item.avgDistance < 500 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        )}>
          {item.avgDistance} km
        </span>
      ),
      sortable: true,
    },
    {
      key: 'volumeHandled',
      header: 'Volume',
      render: (item) => item.volumeHandled.toLocaleString(),
      sortable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Supply Chain Dashboard
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Overview of supply chain metrics, transparency scores, and locality-based taxation
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Supply Chains"
          value={metrics?.totalSupplyChains ?? 0}
          trend={8.2}
          trendLabel="vs last month"
          icon={<Network className="h-6 w-6 text-primary-600" />}
        />
        <MetricCard
          title="Average Distance"
          value={metrics?.avgDistance ?? 0}
          format="distance"
          trend={metrics?.trends.distanceChange}
          trendLabel="vs last month"
          icon={<TrendingDown className="h-6 w-6 text-distance-local" />}
        />
        <MetricCard
          title="Tax Revenue"
          value={metrics?.totalTaxRevenue ?? 0}
          format="currency"
          trend={metrics?.trends.taxRevenueChange}
          trendLabel="vs last month"
          icon={<DollarSign className="h-6 w-6 text-amber-500" />}
        />
        <MetricCard
          title="Avg Transparency Score"
          value={metrics?.avgTransparencyScore ?? 0}
          format="percentage"
          trend={metrics?.trends.transparencyChange}
          trendLabel="vs last month"
          icon={<Shield className="h-6 w-6 text-distance-local" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/tracking">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">Track Product</h3>
                <p className="text-sm text-slate-500">Follow product journey through supply chain</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>

        <Link href="/distance">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">Calculate Distance</h3>
                <p className="text-sm text-slate-500">Estimate economic distance and taxes</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>

        <Link href="/network">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Network className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">View Network</h3>
                <p className="text-sm text-slate-500">Explore supply chain network graph</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Top Producers & Transparency Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Local Producers</CardTitle>
            <Link href="/transparency/rankings">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <DataTable
              data={topProducers}
              columns={producerColumns}
              keyExtractor={(item) => item.id}
              emptyMessage="No producers found"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distance Tier Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[
                { label: 'Local (0-50 km)', percentage: 35, color: 'bg-distance-local' },
                { label: 'Regional (50-200 km)', percentage: 28, color: 'bg-distance-regional' },
                { label: 'National (200-500 km)', percentage: 22, color: 'bg-distance-national' },
                { label: 'International (500+ km)', percentage: 15, color: 'bg-distance-international' },
              ].map((tier) => (
                <div key={tier.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{tier.label}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{tier.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', tier.color)}
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-distance-local">63%</span> of supply chains are within regional distance,
                supporting the local economy and reducing environmental impact.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
