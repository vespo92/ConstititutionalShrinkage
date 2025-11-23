'use client';

import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { ProgressRing } from '@/components/widgets/ProgressRing';
import { LineChart } from '@/components/charts/LineChart';
import { RadarChart } from '@/components/charts/RadarChart';
import { BarChart } from '@/components/charts/BarChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function TBLDashboard() {
  const { data, isLoading } = useAnalytics('tbl');

  const tblTrend = [
    { month: 'Jul', people: 72, planet: 78, profit: 68 },
    { month: 'Aug', people: 74, planet: 80, profit: 70 },
    { month: 'Sep', people: 75, planet: 82, profit: 69 },
    { month: 'Oct', people: 77, planet: 84, profit: 71 },
    { month: 'Nov', people: 78, planet: 85, profit: 72 },
    { month: 'Dec', people: 78, planet: 85, profit: 72 },
  ];

  const radarData = [
    { metric: 'Citizen Satisfaction', people: 82, target: 85 },
    { metric: 'Equality Index', people: 75, target: 80 },
    { metric: 'Carbon Reduction', planet: 85, target: 90 },
    { metric: 'Renewable Energy', planet: 72, target: 80 },
    { metric: 'Economic Growth', profit: 78, target: 75 },
    { metric: 'Job Creation', profit: 82, target: 80 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Triple Bottom Line</h1>
        <p className="text-gray-500 mt-1">
          People, Planet, and Profit metrics for sustainable governance
        </p>
      </div>

      {/* TBL Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium opacity-90">People</h3>
              <p className="text-3xl font-bold mt-1">{data?.tbl?.people ?? 78}%</p>
            </div>
            <ProgressRing
              value={data?.tbl?.people ?? 78}
              size={80}
              strokeWidth={8}
              color="rgba(255,255,255,0.9)"
              backgroundColor="rgba(255,255,255,0.2)"
            />
          </div>
          <div className="flex justify-between text-sm opacity-80">
            <span>Target: 85%</span>
            <span>+6.2% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium opacity-90">Planet</h3>
              <p className="text-3xl font-bold mt-1">{data?.tbl?.planet ?? 85}%</p>
            </div>
            <ProgressRing
              value={data?.tbl?.planet ?? 85}
              size={80}
              strokeWidth={8}
              color="rgba(255,255,255,0.9)"
              backgroundColor="rgba(255,255,255,0.2)"
            />
          </div>
          <div className="flex justify-between text-sm opacity-80">
            <span>Target: 90%</span>
            <span>+3.8% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium opacity-90">Profit</h3>
              <p className="text-3xl font-bold mt-1">{data?.tbl?.profit ?? 72}%</p>
            </div>
            <ProgressRing
              value={data?.tbl?.profit ?? 72}
              size={80}
              strokeWidth={8}
              color="rgba(255,255,255,0.9)"
              backgroundColor="rgba(255,255,255,0.2)"
            />
          </div>
          <div className="flex justify-between text-sm opacity-80">
            <span>Target: 75%</span>
            <span>+2.1% vs last month</span>
          </div>
        </div>
      </div>

      {/* TBL Trend */}
      <ChartContainer
        title="TBL Score Trends"
        subtitle="Historical performance across all three dimensions"
      >
        <LineChart
          data={tblTrend}
          xKey="month"
          yKey={['people', 'planet', 'profit']}
          color={['#EC4899', '#22C55E', '#3B82F6']}
          loading={isLoading}
          showLegend
          height={350}
        />
      </ChartContainer>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Performance Radar">
          <RadarChart
            data={radarData}
            dataKey="people"
            nameKey="metric"
            color="#EC4899"
            loading={isLoading}
          />
        </ChartContainer>

        <ChartContainer title="Policy Effectiveness by TBL Impact">
          <BarChart
            data={[
              { policy: 'Climate Action', people: 65, planet: 92, profit: 45 },
              { policy: 'Job Training', people: 88, planet: 30, profit: 75 },
              { policy: 'Green Energy', people: 72, planet: 95, profit: 68 },
              { policy: 'Healthcare', people: 95, planet: 40, profit: 55 },
              { policy: 'Tax Reform', people: 60, planet: 25, profit: 85 },
            ]}
            xKey="policy"
            yKey={['people', 'planet', 'profit']}
            color={['#EC4899', '#22C55E', '#3B82F6']}
            loading={isLoading}
            showLegend
          />
        </ChartContainer>
      </div>

      {/* Metric Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartContainer title="People Metrics">
          <div className="space-y-4">
            <MetricRow label="Citizen Satisfaction" value={82} target={85} />
            <MetricRow label="Equality Index" value={75} target={80} />
            <MetricRow label="Participation Rate" value={68} target={70} />
            <MetricRow label="Access Score" value={79} target={85} />
          </div>
        </ChartContainer>

        <ChartContainer title="Planet Metrics">
          <div className="space-y-4">
            <MetricRow label="Carbon Reduction" value={85} target={90} color="green" />
            <MetricRow label="Local Supply Chain" value={62} target={70} color="green" />
            <MetricRow label="Renewable Energy" value={72} target={80} color="green" />
            <MetricRow label="Waste Reduction" value={68} target={75} color="green" />
          </div>
        </ChartContainer>

        <ChartContainer title="Profit Metrics">
          <div className="space-y-4">
            <MetricRow label="Cost Savings" value={78} target={80} color="blue" />
            <MetricRow label="Economic Growth" value={72} target={75} color="blue" />
            <MetricRow label="Jobs Created" value={82} target={80} color="blue" />
            <MetricRow label="Small Business Growth" value={65} target={70} color="blue" />
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  target,
  color = 'pink',
}: {
  label: string;
  value: number;
  target: number;
  color?: 'pink' | 'green' | 'blue';
}) {
  const colorClasses = {
    pink: 'bg-pink-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">Target: {target}%</div>
    </div>
  );
}
