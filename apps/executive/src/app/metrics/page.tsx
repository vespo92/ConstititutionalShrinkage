'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { TBLDashboard } from '@/components/metrics/TBLDashboard';
import { MetricsChart } from '@/components/metrics/MetricsChart';
import { ScoreCard, ScoreCardGrid } from '@/components/metrics/ScoreCard';
import { Button } from '@/components/ui/Button';
import { Tabs, TabPanel } from '@/components/shared/Tabs';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { useMockTBLScore, useMockTBLHistory, useMockKPIs } from '@/hooks/useMetrics';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People' },
  { id: 'planet', label: 'Planet' },
  { id: 'profit', label: 'Profit' },
];

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | undefined>();

  const { data: tblData } = useMockTBLScore();
  const { data: historyData } = useMockTBLHistory(12);
  const { data: kpiData } = useMockKPIs();

  const tblScore = tblData?.data;
  const kpis = kpiData?.data || [];

  return (
    <div className="space-y-6">
      <Navigation
        title="Metrics & Performance"
        description="Track Triple Bottom Line metrics and regional performance indicators."
        actions={
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Link href="/metrics/reports">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </Button>
            </Link>
          </div>
        }
      />

      {/* TBL Overview */}
      {tblScore && <TBLDashboard score={tblScore} />}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <TabPanel id="overview" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Trend Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">TBL Trend (12 Months)</h3>
              <MetricsChart data={historyData} type="area" />
            </div>

            {/* KPIs */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
              <ScoreCardGrid>
                {kpis.map((kpi) => (
                  <ScoreCard
                    key={kpi.id}
                    title={kpi.name}
                    score={Math.round((kpi.value / kpi.target) * 100)}
                    trend={kpi.trend}
                    trendPercentage={kpi.trendPercentage}
                    category={kpi.category}
                    showGrade
                  />
                ))}
              </ScoreCardGrid>
            </div>
          </div>
        </TabPanel>

        <TabPanel id="people" activeTab={activeTab}>
          {tblScore && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(tblScore.people.components).map(([key, value]) => (
                  <ScoreCard
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    score={value}
                    trend={value > 70 ? 'up' : value > 50 ? 'stable' : 'down'}
                    category="people"
                    showGrade
                  />
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">People Metrics Trend</h3>
                <MetricsChart
                  data={historyData.map((d) => ({ ...d, planet: d.people, profit: d.people }))}
                  type="line"
                  showLegend={false}
                />
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel id="planet" activeTab={activeTab}>
          {tblScore && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(tblScore.planet.components).map(([key, value]) => (
                  <ScoreCard
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    score={value}
                    trend={value > 70 ? 'up' : value > 50 ? 'stable' : 'down'}
                    category="planet"
                    showGrade
                  />
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Planet Metrics Trend</h3>
                <MetricsChart
                  data={historyData.map((d) => ({ ...d, people: d.planet, profit: d.planet }))}
                  type="line"
                  showLegend={false}
                />
              </div>
            </div>
          )}
        </TabPanel>

        <TabPanel id="profit" activeTab={activeTab}>
          {tblScore && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(tblScore.profit.components).map(([key, value]) => (
                  <ScoreCard
                    key={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    score={value}
                    trend={value > 70 ? 'up' : value > 50 ? 'stable' : 'down'}
                    category="profit"
                    showGrade
                  />
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Profit Metrics Trend</h3>
                <MetricsChart
                  data={historyData.map((d) => ({ ...d, people: d.profit, planet: d.profit }))}
                  type="line"
                  showLegend={false}
                />
              </div>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
