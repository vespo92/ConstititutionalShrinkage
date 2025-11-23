'use client';

import { ChartContainer } from '@/components/layouts/ChartContainer';
import { DashboardGrid } from '@/components/layouts/DashboardGrid';
import { StatCard } from '@/components/widgets/StatCard';
import { LineChart } from '@/components/charts/LineChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRealTimeData } from '@/hooks/useRealTimeData';

export default function AdminDashboard() {
  const { data, isLoading } = useAnalytics('admin');
  const { isConnected, lastUpdated } = useRealTimeData('system:health');

  const apiLatencyTrend = [
    { time: '00:00', latency: 45, errors: 0.1 },
    { time: '04:00', latency: 38, errors: 0.05 },
    { time: '08:00', latency: 52, errors: 0.15 },
    { time: '12:00', latency: 78, errors: 0.25 },
    { time: '16:00', latency: 65, errors: 0.18 },
    { time: '20:00', latency: 48, errors: 0.12 },
  ];

  const resourceUsage = [
    { time: '00:00', cpu: 35, memory: 62, disk: 45 },
    { time: '04:00', cpu: 28, memory: 58, disk: 45 },
    { time: '08:00', cpu: 55, memory: 72, disk: 46 },
    { time: '12:00', cpu: 72, memory: 78, disk: 47 },
    { time: '16:00', cpu: 68, memory: 75, disk: 48 },
    { time: '20:00', cpu: 42, memory: 65, disk: 48 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-500 mt-1">
            Monitor system health, performance, and infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex h-3 w-3 relative ${isConnected ? '' : 'opacity-50'}`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last update: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* System Metrics */}
      <DashboardGrid columns={4}>
        <StatCard
          title="API Latency (p95)"
          value="45ms"
          change={-12.5}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Error Rate"
          value="0.12%"
          change={-8.2}
          icon="activity"
          loading={isLoading}
        />
        <StatCard
          title="Active Sessions"
          value={3421}
          change={15.3}
          icon="users"
          loading={isLoading}
        />
        <StatCard
          title="Queue Depth"
          value={127}
          change={-22.1}
          icon="activity"
          loading={isLoading}
        />
      </DashboardGrid>

      {/* API Performance */}
      <ChartContainer
        title="API Performance"
        subtitle="Response time and error rate over 24 hours"
      >
        <LineChart
          data={apiLatencyTrend}
          xKey="time"
          yKey={['latency', 'errors']}
          color={['#3B82F6', '#EF4444']}
          loading={isLoading}
          showLegend
          height={300}
        />
      </ChartContainer>

      {/* Resource Usage */}
      <ChartContainer
        title="Resource Utilization"
        subtitle="CPU, Memory, and Disk usage"
      >
        <AreaChart
          data={resourceUsage}
          xKey="time"
          yKey={['cpu', 'memory', 'disk']}
          color={['#3B82F6', '#8B5CF6', '#10B981']}
          loading={isLoading}
          showLegend
          height={300}
        />
      </ChartContainer>

      {/* Service Status */}
      <ChartContainer title="Service Status">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'API Gateway', status: 'healthy', latency: '12ms', uptime: '99.99%' },
            { name: 'Auth Service', status: 'healthy', latency: '8ms', uptime: '99.98%' },
            { name: 'User Service', status: 'healthy', latency: '15ms', uptime: '99.97%' },
            { name: 'Voting Service', status: 'healthy', latency: '22ms', uptime: '99.99%' },
            { name: 'Analytics Service', status: 'healthy', latency: '35ms', uptime: '99.95%' },
            { name: 'Notification Service', status: 'warning', latency: '85ms', uptime: '99.85%' },
            { name: 'Search Service', status: 'healthy', latency: '28ms', uptime: '99.96%' },
            { name: 'Database (Primary)', status: 'healthy', latency: '5ms', uptime: '99.99%' },
            { name: 'Database (Replica)', status: 'healthy', latency: '8ms', uptime: '99.98%' },
            { name: 'Redis Cache', status: 'healthy', latency: '2ms', uptime: '99.99%' },
            { name: 'Message Queue', status: 'healthy', latency: '10ms', uptime: '99.97%' },
            { name: 'CDN', status: 'healthy', latency: '15ms', uptime: '99.99%' },
          ].map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${
                  service.status === 'healthy' ? 'bg-green-500' :
                  service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-gray-900">{service.name}</span>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-600">{service.latency}</p>
                <p className="text-gray-400">{service.uptime}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      {/* Recent Alerts */}
      <ChartContainer title="Recent Alerts">
        <div className="space-y-4">
          {[
            { level: 'warning', message: 'Notification Service latency above threshold', time: '5 min ago', resolved: false },
            { level: 'info', message: 'Scheduled maintenance window starting in 2 hours', time: '15 min ago', resolved: false },
            { level: 'error', message: 'Database connection pool exhausted', time: '1 hour ago', resolved: true },
            { level: 'warning', message: 'High memory usage on analytics-worker-3', time: '2 hours ago', resolved: true },
            { level: 'info', message: 'New deployment completed successfully', time: '3 hours ago', resolved: true },
          ].map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                alert.level === 'error' ? 'bg-red-500' :
                alert.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${alert.resolved ? 'text-gray-500' : 'text-gray-900'}`}>
                  {alert.message}
                </p>
                <p className="text-xs text-gray-400">{alert.time}</p>
              </div>
              {alert.resolved && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Resolved
                </span>
              )}
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
