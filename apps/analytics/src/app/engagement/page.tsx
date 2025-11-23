'use client';

import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { StatCard } from '@/components/widgets/StatCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { PieChart } from '@/components/charts/PieChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function EngagementAnalytics() {
  const { data, isLoading } = useAnalytics('engagement');

  const engagementTrend = [
    { date: 'Jan 1', users: 45000, sessions: 62000, votes: 12000 },
    { date: 'Jan 8', users: 48000, sessions: 68000, votes: 15000 },
    { date: 'Jan 15', users: 52000, sessions: 74000, votes: 18000 },
    { date: 'Jan 22', users: 55000, sessions: 78000, votes: 22000 },
    { date: 'Jan 29', users: 58000, sessions: 82000, votes: 25000 },
    { date: 'Feb 5', users: 61000, sessions: 88000, votes: 28000 },
  ];

  const delegationData = [
    { category: 'Environment', delegations: 45000 },
    { category: 'Economy', delegations: 38000 },
    { category: 'Healthcare', delegations: 32000 },
    { category: 'Education', delegations: 28000 },
    { category: 'Infrastructure', delegations: 22000 },
    { category: 'Defense', delegations: 18000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Citizen Engagement</h1>
        <p className="text-gray-500 mt-1">
          Track citizen participation, delegations, and platform activity
        </p>
      </div>

      {/* Key Metrics */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Active Citizens"
          value={127453}
          change={12.5}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Daily Active Users"
          value={45230}
          change={8.2}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Active Delegations"
          value={183000}
          change={15.3}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Avg. Session Time"
          value="8.5 min"
          change={4.2}
          icon="activity"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* Engagement Trend */}
      <ChartContainer
        title="Engagement Trends"
        subtitle="Weekly active users, sessions, and votes"
      >
        <AreaChart
          data={engagementTrend}
          xKey="date"
          yKey={['users', 'sessions', 'votes']}
          color={['#3B82F6', '#8B5CF6', '#10B981']}
          loading={isLoading}
          showLegend
          height={350}
        />
      </ChartContainer>

      {/* Delegation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Delegations by Category">
          <BarChart
            data={delegationData}
            xKey="category"
            yKey="delegations"
            color="#8B5CF6"
            loading={isLoading}
            horizontal
          />
        </ChartContainer>

        <ChartContainer title="Delegation Types">
          <PieChart
            data={[
              { name: 'Full Delegation', value: 35, color: '#3B82F6' },
              { name: 'Topic-Specific', value: 45, color: '#8B5CF6' },
              { name: 'Temporary', value: 15, color: '#10B981' },
              { name: 'Partial', value: 5, color: '#F59E0B' },
            ]}
            loading={isLoading}
          />
        </ChartContainer>
      </div>

      {/* User Retention */}
      <ChartContainer title="User Retention Cohorts">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 1</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 2</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 3</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 4</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 5</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Week 6</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cohort: 'Jan Week 1', values: [100, 72, 58, 48, 42, 38] },
                { cohort: 'Jan Week 2', values: [100, 75, 62, 52, 45, null] },
                { cohort: 'Jan Week 3', values: [100, 78, 65, 55, null, null] },
                { cohort: 'Jan Week 4', values: [100, 74, 61, null, null, null] },
                { cohort: 'Feb Week 1', values: [100, 76, null, null, null, null] },
              ].map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.cohort}</td>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 text-center">
                      {value !== null ? (
                        <span
                          className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                            value >= 70 ? 'bg-green-100 text-green-800' :
                            value >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            value >= 30 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {value}%
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>

      {/* Top Contributors */}
      <ChartContainer title="Top Contributors This Month">
        <div className="space-y-4">
          {[
            { rank: 1, name: 'citizen_42', proposals: 12, votes: 156, delegations: 45 },
            { rank: 2, name: 'democracy_fan', proposals: 8, votes: 203, delegations: 38 },
            { rank: 3, name: 'policy_wonk', proposals: 15, votes: 89, delegations: 52 },
            { rank: 4, name: 'civic_leader', proposals: 6, votes: 178, delegations: 28 },
            { rank: 5, name: 'engaged_voter', proposals: 4, votes: 245, delegations: 15 },
          ].map((user) => (
            <div key={user.rank} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                user.rank === 1 ? 'bg-yellow-500' :
                user.rank === 2 ? 'bg-gray-400' :
                user.rank === 3 ? 'bg-amber-600' : 'bg-gray-300'
              }`}>
                {user.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.proposals}</p>
                  <p className="text-gray-500">Proposals</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.votes}</p>
                  <p className="text-gray-500">Votes</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{user.delegations}</p>
                  <p className="text-gray-500">Delegators</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
