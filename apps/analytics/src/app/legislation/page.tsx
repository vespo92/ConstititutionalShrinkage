'use client';

import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { StatCard } from '@/components/widgets/StatCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function LegislationAnalytics() {
  const { data, isLoading } = useAnalytics('legislation');

  const billLifecycle = [
    { stage: 'Draft', count: 45 },
    { stage: 'Review', count: 32 },
    { stage: 'Voting', count: 12 },
    { stage: 'Passed', count: 156 },
    { stage: 'Rejected', count: 23 },
    { stage: 'Sunset', count: 8 },
  ];

  const billTrend = [
    { month: 'Jul', proposed: 45, passed: 28, rejected: 8 },
    { month: 'Aug', proposed: 52, passed: 35, rejected: 12 },
    { month: 'Sep', proposed: 38, passed: 22, rejected: 6 },
    { month: 'Oct', proposed: 61, passed: 41, rejected: 14 },
    { month: 'Nov', proposed: 55, passed: 38, rejected: 9 },
    { month: 'Dec', proposed: 42, passed: 31, rejected: 7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Legislation Analytics</h1>
        <p className="text-gray-500 mt-1">
          Track bill lifecycle, passage rates, and legislative efficiency
        </p>
      </div>

      {/* Key Metrics */}
      <DashboardGrid columns={4}>
        <StatCard
          title="Total Bills (YTD)"
          value={293}
          change={12.5}
          icon="file-text"
          loading={isLoading}
        />
        <StatCard
          title="Passage Rate"
          value="72.4%"
          change={4.2}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Avg. Days to Pass"
          value={18}
          change={-15.8}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Pending Review"
          value={32}
          change={-8.2}
          icon="file-text"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* Bill Lifecycle */}
      <ChartContainer
        title="Bill Lifecycle Distribution"
        subtitle="Current status of all bills in the system"
      >
        <BarChart
          data={billLifecycle}
          xKey="stage"
          yKey="count"
          color="#8B5CF6"
          loading={isLoading}
          height={300}
        />
      </ChartContainer>

      {/* Bill Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Monthly Bill Activity">
          <AreaChart
            data={billTrend}
            xKey="month"
            yKey={['proposed', 'passed', 'rejected']}
            color={['#3B82F6', '#22C55E', '#EF4444']}
            loading={isLoading}
            showLegend
            stacked
          />
        </ChartContainer>

        <ChartContainer title="Bills by Category">
          <BarChart
            data={data?.legislationByCategory ?? []}
            xKey="category"
            yKey="count"
            color="#10B981"
            loading={isLoading}
            horizontal
          />
        </ChartContainer>
      </div>

      {/* Efficiency Metrics */}
      <ChartContainer title="Legislative Efficiency Trends">
        <LineChart
          data={[
            { month: 'Jul', avgDays: 24, targetDays: 20 },
            { month: 'Aug', avgDays: 22, targetDays: 20 },
            { month: 'Sep', avgDays: 19, targetDays: 20 },
            { month: 'Oct', avgDays: 18, targetDays: 20 },
            { month: 'Nov', avgDays: 17, targetDays: 20 },
            { month: 'Dec', avgDays: 18, targetDays: 20 },
          ]}
          xKey="month"
          yKey={['avgDays', 'targetDays']}
          color={['#3B82F6', '#9CA3AF']}
          loading={isLoading}
          showLegend
          height={300}
        />
      </ChartContainer>

      {/* Sunset Tracking */}
      <ChartContainer title="Upcoming Sunsets">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sunset Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effectiveness Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { bill: 'Clean Air Initiative', category: 'Environment', sunset: 'Mar 15, 2025', score: 85, status: 'Likely Renew' },
                { bill: 'Small Business Tax Credit', category: 'Economy', sunset: 'Apr 1, 2025', score: 72, status: 'Under Review' },
                { bill: 'Digital Privacy Act', category: 'Technology', sunset: 'Apr 30, 2025', score: 91, status: 'Likely Renew' },
                { bill: 'Housing Subsidy Program', category: 'Housing', sunset: 'May 15, 2025', score: 45, status: 'At Risk' },
                { bill: 'Education Fund 2023', category: 'Education', sunset: 'Jun 1, 2025', score: 78, status: 'Under Review' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.bill}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sunset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-full rounded-full ${
                            item.score >= 70 ? 'bg-green-500' :
                            item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{item.score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Likely Renew' ? 'bg-green-100 text-green-800' :
                      item.status === 'At Risk' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
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
