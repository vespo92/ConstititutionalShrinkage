'use client';

import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  loading?: boolean;
}

export function Sparkline({
  data,
  color = '#3B82F6',
  height = 40,
  loading = false,
}: SparklineProps) {
  if (loading) {
    return (
      <div className="animate-pulse h-10 bg-gray-100 rounded" />
    );
  }

  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
