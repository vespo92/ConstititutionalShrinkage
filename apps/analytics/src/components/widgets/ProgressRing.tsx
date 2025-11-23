'use client';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  loading?: boolean;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  label,
  loading = false,
}: ProgressRingProps) {
  if (loading) {
    return (
      <div className="animate-pulse flex items-center justify-center">
        <div
          className="rounded-full bg-gray-200"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          {Math.round(percentage * 100)}%
        </span>
        {label && (
          <span className="text-xs text-gray-500">{label}</span>
        )}
      </div>
    </div>
  );
}
