'use client';

import { useState } from 'react';
import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { StatCard } from '@/components/widgets/StatCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { Heatmap } from '@/components/charts/Heatmap';
import { FilterBar } from '@/components/filters/FilterBar';
import { useAnalytics } from '@/hooks/useAnalytics';

const hoursOfDay = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function VotingAnalytics() {
  const { data, isLoading, refetch } = useAnalytics('voting');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Mock heatmap data
  const heatmapData = daysOfWeek.flatMap((day) =>
    hoursOfDay.map((hour) => ({
      x: hour,
      y: day,
      value: Math.floor(Math.random() * 100),
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voting Analytics</h1>
        <p className="text-gray-500 mt-1">
          Track voting patterns, participation rates, and session statistics
        </p>
      </div>

      <FilterBar onRefresh={handleRefresh} isRefreshing={isRefreshing}>
        <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </FilterBar>

      {/* Key Metrics */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Total Votes Cast"
          value={1284563}
          change={15.2}
          icon="vote"
          loading={isLoading}
        />
        <StatCard
          title="Active Sessions"
          value={12}
          change={3}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Avg. Participation"
          value="68.5%"
          change={5.8}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Avg. Time to Vote"
          value="4.2 min"
          change={-12.3}
          icon="activity"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* Voting Trend */}
      <ChartContainer
        title="Voting Activity Over Time"
        subtitle="Daily votes cast in the selected period"
      >
        <LineChart
          data={data?.votingTrend ?? []}
          xKey="date"
          yKey="votes"
          color="#3B82F6"
          loading={isLoading}
          height={350}
        />
      </ChartContainer>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Vote Distribution">
          <PieChart
            data={[
              { name: 'Yes', value: 62, color: '#22C55E' },
              { name: 'No', value: 28, color: '#EF4444' },
              { name: 'Abstain', value: 10, color: '#9CA3AF' },
            ]}
            loading={isLoading}
          />
        </ChartContainer>

        <ChartContainer title="Participation by Region">
          <BarChart
            data={data?.regionalParticipation ?? []}
            xKey="region"
            yKey="rate"
            color="#8B5CF6"
            loading={isLoading}
          />
        </ChartContainer>
      </div>

      {/* Peak Voting Hours Heatmap */}
      <ChartContainer
        title="Peak Voting Hours"
        subtitle="When citizens are most active in voting"
      >
        <Heatmap
          data={heatmapData}
          xLabels={hoursOfDay}
          yLabels={daysOfWeek}
          loading={isLoading}
          height={320}
        />
      </ChartContainer>

      {/* Recent Sessions */}
      <ChartContainer title="Recent Voting Sessions">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { id: 'VS-2024-156', bill: 'Climate Action Bill', votes: 12450, participation: 78, result: 'Passed' },
                { id: 'VS-2024-155', bill: 'Education Reform Act', votes: 10230, participation: 65, result: 'Pending' },
                { id: 'VS-2024-154', bill: 'Tax Amendment 12', votes: 8920, participation: 71, result: 'Passed' },
                { id: 'VS-2024-153', bill: 'Infrastructure Bill', votes: 11340, participation: 74, result: 'Rejected' },
                { id: 'VS-2024-152', bill: 'Healthcare Access Act', votes: 9870, participation: 69, result: 'Passed' },
              ].map((session, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.bill}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.votes.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.participation}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      session.result === 'Passed' ? 'bg-green-100 text-green-800' :
                      session.result === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>
    </div>
  );
}
