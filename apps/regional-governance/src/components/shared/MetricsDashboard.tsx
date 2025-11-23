'use client';

import { TBLScore, PodMetrics } from '@/types';

interface MetricsDashboardProps {
  metrics: PodMetrics;
  showTBL?: boolean;
  className?: string;
}

export default function MetricsDashboard({ metrics, showTBL = true, className = '' }: MetricsDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {showTBL && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Triple Bottom Line Score</h4>
          <TBLDisplay score={metrics.tblScore} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <MetricItem
          label="Citizen Satisfaction"
          value={metrics.citizenSatisfaction}
          suffix="%"
          color="green"
        />
        <MetricItem
          label="Participation Rate"
          value={metrics.participationRate}
          suffix="%"
          color="blue"
        />
        <MetricItem
          label="Legislation Passed"
          value={metrics.legislationPassed}
          color="purple"
        />
        <MetricItem
          label="Resource Efficiency"
          value={metrics.resourceEfficiency}
          suffix="%"
          color="amber"
        />
      </div>
    </div>
  );
}

function TBLDisplay({ score }: { score: TBLScore }) {
  return (
    <div className="bg-gradient-to-r from-pod-green-50 to-pod-brown-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-pod-green-700">{score.overall.toFixed(1)}</span>
        <span className="text-sm text-gray-500">Overall Score</span>
      </div>
      <div className="space-y-2">
        <TBLBar label="People" value={score.people} color="bg-blue-500" />
        <TBLBar label="Planet" value={score.planet} color="bg-green-500" />
        <TBLBar label="Profit" value={score.profit} color="bg-amber-500" />
      </div>
    </div>
  );
}

function TBLBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-gray-600 w-12">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8">{value}</span>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: number;
  suffix?: string;
  color: 'green' | 'blue' | 'purple' | 'amber' | 'red';
}

function MetricItem({ label, value, suffix = '', color }: MetricItemProps) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClasses[color]}`}>
        {value}{suffix}
      </p>
    </div>
  );
}
