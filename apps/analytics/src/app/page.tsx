'use client';

import { StatCard } from '@/components/widgets/StatCard';
import { TrendIndicator } from '@/components/widgets/TrendIndicator';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { ChartContainer } from '@/components/layouts/ChartContainer';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function OverviewDashboard() {
  const { data, isLoading, error } = useAnalytics('overview');

  if (error) {
    return (
      <div className="text-red-600">
        Error loading analytics data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-500 mt-1">
            Real-time governance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Key Metrics */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Active Citizens"
          value={data?.activeCitizens ?? 0}
          change={12.5}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Bills in Progress"
          value={data?.billsInProgress ?? 0}
          change={-3.2}
          icon="file-text"
          loading={isLoading}
        />
        <StatCard
          title="Participation Rate"
          value={`${data?.participationRate ?? 0}%`}
          change={5.8}
          icon="vote"
          loading={isLoading}
        />
        <StatCard
          title="TBL Health Score"
          value={data?.tblScore ?? 0}
          change={2.1}
          icon="activity"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Voting Activity (Last 30 Days)">
          <LineChart
            data={data?.votingTrend ?? []}
            xKey="date"
            yKey="votes"
            color="#3B82F6"
            loading={isLoading}
          />
        </ChartContainer>

        <ChartContainer title="Regional Participation">
          <BarChart
            data={data?.regionalParticipation ?? []}
            xKey="region"
            yKey="rate"
            color="#8B5CF6"
            loading={isLoading}
          />
        </ChartContainer>
      </div>

      {/* TBL Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartContainer title="Triple Bottom Line">
          <div className="flex items-center justify-center h-64">
            <PieChart
              data={[
                { name: 'People', value: data?.tbl?.people ?? 0, color: '#EC4899' },
                { name: 'Planet', value: data?.tbl?.planet ?? 0, color: '#22C55E' },
                { name: 'Profit', value: data?.tbl?.profit ?? 0, color: '#3B82F6' },
              ]}
              loading={isLoading}
            />
          </div>
        </ChartContainer>

        <ChartContainer title="Legislation by Category">
          <BarChart
            data={data?.legislationByCategory ?? []}
            xKey="category"
            yKey="count"
            color="#10B981"
            loading={isLoading}
            horizontal
          />
        </ChartContainer>

        <ChartContainer title="System Health">
          <div className="space-y-4 p-4">
            <HealthMetric
              label="API Response Time"
              value={data?.systemHealth?.apiLatency ?? 0}
              unit="ms"
              max={500}
              status={getHealthStatus(data?.systemHealth?.apiLatency, 100, 300)}
            />
            <HealthMetric
              label="Error Rate"
              value={data?.systemHealth?.errorRate ?? 0}
              unit="%"
              max={5}
              status={getHealthStatus(data?.systemHealth?.errorRate, 1, 3)}
            />
            <HealthMetric
              label="Active Sessions"
              value={data?.systemHealth?.activeSessions ?? 0}
              unit=""
              max={10000}
              status="healthy"
            />
            <HealthMetric
              label="Queue Depth"
              value={data?.systemHealth?.queueDepth ?? 0}
              unit=""
              max={1000}
              status={getHealthStatus(data?.systemHealth?.queueDepth, 100, 500)}
            />
          </div>
        </ChartContainer>
      </div>

      {/* Recent Activity */}
      <ChartContainer title="Recent Governance Activity">
        <div className="divide-y divide-gray-100">
          {(data?.recentActivity ?? []).slice(0, 5).map((activity: any, index: number) => (
            <div key={index} className="px-4 py-3 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
          {(!data?.recentActivity || data.recentActivity.length === 0) && !isLoading && (
            <div className="px-4 py-8 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </ChartContainer>
    </div>
  );
}

function HealthMetric({
  label,
  value,
  unit,
  max,
  status,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  status: 'healthy' | 'warning' | 'critical';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[status]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getHealthStatus(value: number | undefined, warnThreshold: number, critThreshold: number): 'healthy' | 'warning' | 'critical' {
  if (value === undefined) return 'healthy';
  if (value >= critThreshold) return 'critical';
  if (value >= warnThreshold) return 'warning';
  return 'healthy';
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    vote: 'bg-blue-500',
    bill: 'bg-purple-500',
    amendment: 'bg-yellow-500',
    sunset: 'bg-red-500',
    delegation: 'bg-green-500',
  };
  return colors[type] || 'bg-gray-400';
}
