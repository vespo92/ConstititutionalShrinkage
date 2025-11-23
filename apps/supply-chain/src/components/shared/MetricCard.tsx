import { type ReactNode } from 'react';
import { cn, formatNumber, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  format?: 'number' | 'currency' | 'percentage' | 'distance';
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  format = 'number',
  trend,
  trendLabel,
  icon,
  className,
}: MetricCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value / 100);
      case 'distance':
        return `${formatNumber(value, 1)} km`;
      default:
        return formatNumber(value);
    }
  };

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <Minus className="h-4 w-4 text-slate-400" />;
    }
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendClass = () => {
    if (trend === undefined || trend === 0) {
      return 'text-slate-500';
    }
    return trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {formatValue()}
          </p>
          {trend !== undefined && (
            <div className={cn('mt-2 flex items-center gap-1 text-sm', getTrendClass())}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{formatNumber(trend, 1)}%</span>
              {trendLabel && (
                <span className="text-slate-500 dark:text-slate-400 ml-1">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
