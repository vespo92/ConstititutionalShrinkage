'use client';

import { Navigation } from '@/components/layout/Navigation';
import { KPIGrid } from '@/components/dashboard/KPICard';
import { ActivityFeed, mockActivities } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AlertsBanner, mockAlerts } from '@/components/dashboard/AlertsBanner';
import { TBLDashboard } from '@/components/metrics/TBLDashboard';
import { EmergencyPanel, mockIncidents } from '@/components/emergency/EmergencyPanel';
import { PolicyList } from '@/components/policies/PolicyCard';
import { useMockTBLScore, useMockKPIs } from '@/hooks/useMetrics';
import { useMockPolicies } from '@/hooks/usePolicies';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: tblData } = useMockTBLScore();
  const { data: kpiData } = useMockKPIs();
  const { data: policiesData } = useMockPolicies();

  const recentPolicies = policiesData?.data.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Navigation
        title="Executive Dashboard"
        description="Welcome back. Here's an overview of your regional operations."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </Button>
            <Link href="/policies/create">
              <Button size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Policy
              </Button>
            </Link>
          </div>
        }
      />

      {/* Alerts */}
      <AlertsBanner alerts={mockAlerts} />

      {/* KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
        {kpiData && <KPIGrid kpis={kpiData.data} />}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - TBL & Policies */}
        <div className="lg:col-span-2 space-y-6">
          {/* TBL Dashboard */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Triple Bottom Line</h2>
              <Link href="/metrics" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Details
              </Link>
            </div>
            {tblData && <TBLDashboard score={tblData.data} />}
          </section>

          {/* Recent Policies */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Policies</h2>
              <Link href="/policies" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All ({policiesData?.data.length || 0})
              </Link>
            </div>
            <PolicyList policies={recentPolicies} view="grid" />
          </section>
        </div>

        {/* Right Column - Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Emergency Panel */}
          <EmergencyPanel incidents={mockIncidents} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Activity Feed */}
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
