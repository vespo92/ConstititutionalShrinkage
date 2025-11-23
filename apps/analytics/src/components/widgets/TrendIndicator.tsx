'use client';

import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TrendIndicator({
  value,
  label,
  showIcon = true,
  size = 'md',
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1',
        sizeClasses[size],
        isNeutral
          ? 'text-gray-500'
          : isPositive
          ? 'text-green-600'
          : 'text-red-600'
      )}
    >
      {showIcon && (
        <>
          {isNeutral ? (
            <Minus className={iconSizes[size]} />
          ) : isPositive ? (
            <TrendingUp className={iconSizes[size]} />
          ) : (
            <TrendingDown className={iconSizes[size]} />
          )}
        </>
      )}
      <span className="font-medium">
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
      {label && <span className="text-gray-500">{label}</span>}
    </div>
  );
}
