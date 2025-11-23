'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PodMetrics as PodMetricsType } from '@/types';

interface PodMetricsProps {
  metrics: PodMetricsType;
  showTrends?: boolean;
  className?: string;
}

export default function PodMetrics({ metrics, showTrends = false, className = '' }: PodMetricsProps) {
  const metricItems = [
    {
      label: 'Citizen Satisfaction',
      value: metrics.citizenSatisfaction,
      suffix: '%',
      trend: 5,
      color: 'blue',
    },
    {
      label: 'Participation Rate',
      value: metrics.participationRate,
      suffix: '%',
      trend: 3,
      color: 'green',
    },
    {
      label: 'Legislation Passed',
      value: metrics.legislationPassed,
      suffix: '',
      trend: 2,
      color: 'purple',
    },
    {
      label: 'Resource Efficiency',
      value: metrics.resourceEfficiency,
      suffix: '%',
      trend: -1,
      color: 'amber',
    },
  ];

  return (
    <div className={className}>
      {/* TBL Score */}
      <div className="bg-gradient-to-br from-pod-green-50 to-pod-brown-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Triple Bottom Line</h3>
          <div className="text-3xl font-bold text-pod-green-700">
            {metrics.tblScore.overall.toFixed(1)}
          </div>
        </div>

        <div className="space-y-3">
          <TBLMetricBar
            label="People"
            value={metrics.tblScore.people}
            color="bg-blue-500"
            icon="👥"
          />
          <TBLMetricBar
            label="Planet"
            value={metrics.tblScore.planet}
            color="bg-green-500"
            icon="🌍"
          />
          <TBLMetricBar
            label="Profit"
            value={metrics.tblScore.profit}
            color="bg-amber-500"
            icon="💰"
          />
        </div>
      </div>

      {/* Other Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {metricItems.map((item) => (
          <MetricCard
            key={item.label}
            {...item}
            showTrend={showTrends}
          />
        ))}
      </div>
    </div>
  );
}

interface TBLMetricBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

function TBLMetricBar({ label, value, color, icon }: TBLMetricBarProps) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  suffix: string;
  trend: number;
  color: string;
  showTrend: boolean;
}

function MetricCard({ label, value, suffix, trend, color, showTrend }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>
          {value}{suffix}
        </p>
        {showTrend && (
          <div className={`flex items-center text-sm ${trendColor}`}>
            <TrendIcon size={14} className="mr-1" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
