'use client';

import { cn, getTrendIcon, getTrendColor, getScoreGrade } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage?: number;
  category?: 'people' | 'planet' | 'profit' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
  onClick?: () => void;
}

export function ScoreCard({
  title,
  score,
  trend,
  trendPercentage,
  category = 'general',
  size = 'md',
  showGrade = false,
  onClick,
}: ScoreCardProps) {
  const { grade, color: gradeColor } = getScoreGrade(score);

  const categoryColors = {
    people: 'border-tbl-people bg-tbl-people-light',
    planet: 'border-tbl-planet bg-tbl-planet-light',
    profit: 'border-tbl-profit bg-tbl-profit-light',
    general: 'border-primary-500 bg-primary-50',
  };

  const sizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const scoreSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border-l-4 transition-shadow',
        categoryColors[category],
        sizes[size],
        onClick && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn('font-bold text-gray-900', scoreSizes[size])}>
              {score}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>
        {showGrade && (
          <div className={cn('text-2xl font-bold', gradeColor)}>{grade}</div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor(trend))}>
          {getTrendIcon(trend)}
          {trendPercentage !== undefined && `${Math.abs(trendPercentage)}%`}
        </span>
        <span className="text-xs text-gray-500">vs last period</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            category === 'people' && 'bg-tbl-people',
            category === 'planet' && 'bg-tbl-planet',
            category === 'profit' && 'bg-tbl-profit',
            category === 'general' && 'bg-primary-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface ScoreCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function ScoreCardGrid({ children, columns = 3 }: ScoreCardGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4', gridCols[columns])}>
      {children}
    </div>
  );
}

export default ScoreCard;
