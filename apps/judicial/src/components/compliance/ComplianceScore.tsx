'use client';

import { cn } from '@/lib/utils';

interface ComplianceScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ComplianceScore({ score, size = 'md', showLabel = true }: ComplianceScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-compliance-compliant';
    if (s >= 50) return 'text-compliance-warning';
    return 'text-compliance-violation';
  };

  const getScoreBgColor = (s: number) => {
    if (s >= 80) return 'bg-compliance-compliant';
    if (s >= 50) return 'bg-compliance-warning';
    return 'bg-compliance-violation';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 80) return 'Good';
    if (s >= 70) return 'Fair';
    if (s >= 50) return 'Poor';
    return 'Critical';
  };

  const sizes = {
    sm: {
      container: 'w-16 h-16',
      text: 'text-lg',
      label: 'text-xs',
      stroke: 4,
    },
    md: {
      container: 'w-24 h-24',
      text: 'text-2xl',
      label: 'text-sm',
      stroke: 6,
    },
    lg: {
      container: 'w-32 h-32',
      text: 'text-4xl',
      label: 'text-base',
      stroke: 8,
    },
  };

  const sizeConfig = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative', sizeConfig.container)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-gray-200 dark:text-slate-700"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={getScoreColor(score)}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', sizeConfig.text, getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <span className={cn('font-medium', sizeConfig.label, getScoreColor(score))}>
            {getScoreLabel(score)}
          </span>
        </div>
      )}
    </div>
  );
}

export function ComplianceBar({ score, height = 8 }: { score: number; height?: number }) {
  const getScoreBgColor = (s: number) => {
    if (s >= 80) return 'bg-compliance-compliant';
    if (s >= 50) return 'bg-compliance-warning';
    return 'bg-compliance-violation';
  };

  return (
    <div className="w-full">
      <div
        className="w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreBgColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
