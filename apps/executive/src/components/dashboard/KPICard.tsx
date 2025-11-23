'use client';

import { cn, getTrendIcon, getTrendColor, formatNumber, formatPercentage } from '@/lib/utils';
import type { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  onClick?: () => void;
}

export function KPICard({ kpi, onClick }: KPICardProps) {
  const trendIcon = getTrendIcon(kpi.trend);
  const trendColor = getTrendColor(kpi.trend);
  const progressPercentage = Math.min((kpi.value / kpi.target) * 100, 100);

  const categoryColors = {
    people: 'border-l-tbl-people',
    planet: 'border-l-tbl-planet',
    profit: 'border-l-tbl-profit',
    general: 'border-l-primary-500',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 border-l-4 transition-shadow hover:shadow-md',
        categoryColors[kpi.category],
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
        <span className={cn('text-sm font-medium flex items-center gap-1', trendColor)}>
          {trendIcon}
          {Math.abs(kpi.trendPercentage)}%
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">
          {formatNumber(kpi.value)}
        </span>
        {kpi.unit && <span className="text-sm text-gray-500">{kpi.unit}</span>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>Target: {formatNumber(kpi.target)}{kpi.unit}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              progressPercentage >= 90 ? 'bg-green-500' :
              progressPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface KPIGridProps {
  kpis: KPI[];
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

export default KPICard;
