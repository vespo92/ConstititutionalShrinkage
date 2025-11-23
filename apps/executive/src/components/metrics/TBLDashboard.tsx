'use client';

import { cn, getTrendIcon, getTrendColor, formatPercentage } from '@/lib/utils';
import type { TBLScore } from '@/types';

interface TBLDashboardProps {
  score: TBLScore;
  compact?: boolean;
}

export function TBLDashboard({ score, compact = false }: TBLDashboardProps) {
  const categories = [
    { key: 'people', label: 'People', data: score.people, color: 'tbl-people' },
    { key: 'planet', label: 'Planet', data: score.planet, color: 'tbl-planet' },
    { key: 'profit', label: 'Profit', data: score.profit, color: 'tbl-profit' },
  ] as const;

  if (compact) {
    return (
      <div className="flex items-center gap-6">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', `bg-${cat.color}`)}>
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  cat.key === 'people' && 'bg-tbl-people',
                  cat.key === 'planet' && 'bg-tbl-planet',
                  cat.key === 'profit' && 'bg-tbl-profit'
                )}
              />
            </div>
            <span className="text-sm text-gray-600">{cat.label}</span>
            <span className="text-sm font-semibold text-gray-900">{cat.data.score}%</span>
            <span className={cn('text-sm', getTrendColor(cat.data.trend))}>
              {getTrendIcon(cat.data.trend)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Overall Score */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-1">Overall TBL Score</p>
        <div className="text-5xl font-bold text-gray-900">{score.overallScore}</div>
        <p className="text-sm text-gray-500 mt-1">out of 100</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <TBLCategoryCard
            key={cat.key}
            category={cat.key}
            label={cat.label}
            data={cat.data}
          />
        ))}
      </div>
    </div>
  );
}

interface TBLCategoryCardProps {
  category: 'people' | 'planet' | 'profit';
  label: string;
  data: TBLScore['people'] | TBLScore['planet'] | TBLScore['profit'];
}

function TBLCategoryCard({ category, label, data }: TBLCategoryCardProps) {
  const colorClasses = {
    people: {
      bg: 'bg-tbl-people-light',
      text: 'text-tbl-people-dark',
      bar: 'bg-tbl-people',
      border: 'border-tbl-people',
    },
    planet: {
      bg: 'bg-tbl-planet-light',
      text: 'text-tbl-planet-dark',
      bar: 'bg-tbl-planet',
      border: 'border-tbl-planet',
    },
    profit: {
      bg: 'bg-tbl-profit-light',
      text: 'text-tbl-profit-dark',
      bar: 'bg-tbl-profit',
      border: 'border-tbl-profit',
    },
  };

  const colors = colorClasses[category];

  return (
    <div className={cn('rounded-lg p-4 border-l-4', colors.bg, colors.border)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn('font-semibold', colors.text)}>{label}</h3>
        <div className="flex items-center gap-1">
          <span className={cn('text-lg font-bold', colors.text)}>{data.score}%</span>
          <span className={getTrendColor(data.trend)}>{getTrendIcon(data.trend)}</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(data.components).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 capitalize">{key}</span>
              <span className="font-medium">{value}%</span>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', colors.bar)}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TBLDashboard;
