'use client';

import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { StatCard } from '@/components/widgets/StatCard';
import { BarChart } from '@/components/charts/BarChart';
import { RadarChart } from '@/components/charts/RadarChart';
import { useAnalytics } from '@/hooks/useAnalytics';
import Link from 'next/link';

const regions = [
  { id: 'northeast', name: 'Northeast', population: 56000000, pods: 45, participation: 72, tblScore: 82 },
  { id: 'southeast', name: 'Southeast', population: 84000000, pods: 62, participation: 65, tblScore: 76 },
  { id: 'midwest', name: 'Midwest', population: 68000000, pods: 52, participation: 58, tblScore: 79 },
  { id: 'southwest', name: 'Southwest', population: 42000000, pods: 38, participation: 71, tblScore: 85 },
  { id: 'west', name: 'West', population: 78000000, pods: 58, participation: 68, tblScore: 88 },
];

export default function RegionalAnalytics() {
  const { data, isLoading } = useAnalytics('regions');

  const comparisonData = regions.map((r) => ({
    region: r.name,
    participation: r.participation,
    tblScore: r.tblScore,
  }));

  const radarCompare = [
    { metric: 'Participation', northeast: 72, west: 68 },
    { metric: 'TBL Score', northeast: 82, west: 88 },
    { metric: 'Bill Passage', northeast: 75, west: 82 },
    { metric: 'Citizen Satisfaction', northeast: 78, west: 85 },
    { metric: 'Efficiency', northeast: 70, west: 79 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Regional Analytics</h1>
        <p className="text-gray-500 mt-1">
          Compare performance across regions and regional pods
        </p>
      </div>

      {/* Summary Stats */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Total Regions"
          value={5}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Active Pods"
          value={255}
          change={12}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Avg. Participation"
          value="66.8%"
          change={4.2}
          icon="vote"
          loading={isLoading}
        />
        <StatCard
          title="Avg. TBL Score"
          value={82}
          change={2.8}
          icon="activity"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* Regional Comparison */}
      <ChartContainer title="Regional Comparison">
        <BarChart
          data={comparisonData}
          xKey="region"
          yKey={['participation', 'tblScore']}
          color={['#3B82F6', '#10B981']}
          loading={isLoading}
          showLegend
          height={350}
        />
      </ChartContainer>

      {/* Region Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <Link
            key={region.id}
            href={`/regions/${region.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Population</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(region.population / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Pods</p>
                <p className="text-lg font-semibold text-gray-900">{region.pods}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Participation</p>
                <p className="text-lg font-semibold text-gray-900">{region.participation}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">TBL Score</p>
                <p className={`text-lg font-semibold ${
                  region.tblScore >= 80 ? 'text-green-600' :
                  region.tblScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {region.tblScore}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${region.participation}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Participation rate</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Radar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Northeast vs West Comparison">
          <RadarChart
            data={radarCompare}
            dataKey="northeast"
            nameKey="metric"
            series={[
              { key: 'northeast', name: 'Northeast', color: '#3B82F6' },
              { key: 'west', name: 'West', color: '#10B981' },
            ]}
            loading={isLoading}
          />
        </ChartContainer>

        <ChartContainer title="Regional Rankings">
          <div className="space-y-4">
            {regions
              .sort((a, b) => b.tblScore - a.tblScore)
              .map((region, index) => (
                <div key={region.id} className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{region.name}</p>
                    <p className="text-sm text-gray-500">{region.pods} pods</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{region.tblScore}</p>
                    <p className="text-xs text-gray-500">TBL Score</p>
                  </div>
                </div>
              ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
