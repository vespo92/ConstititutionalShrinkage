'use client';

import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { ChartProps, defaultTheme } from '../types';

export interface SparklineProps extends ChartProps {
  data: number[];
  color?: string;
  showArea?: boolean;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color = defaultTheme.colors.primary,
  loading = false,
  height = 40,
  showArea = false,
  strokeWidth = 2,
  className,
}: SparklineProps) {
  if (loading) {
    return (
      <div className={className} style={{ height }}>
        <div className="animate-pulse h-full bg-gray-100 rounded" />
      </div>
    );
  }

  const chartData = data.map((value, index) => ({ value, index }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1 || 1;

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <YAxis
          domain={[min - padding, max + padding]}
          hide
        />
        <defs>
          <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={strokeWidth}
          dot={false}
          fill={showArea ? `url(#sparkline-gradient-${color.replace('#', '')})` : 'none'}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
