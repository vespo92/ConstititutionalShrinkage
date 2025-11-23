'use client';

import {
  ResponsiveContainer,
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  loading?: boolean;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  gradient?: boolean;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  color = '#3B82F6',
  loading = false,
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  gradient = true,
}: AreaChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse flex flex-col w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const colors = Array.isArray(color) ? color : [color];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {yKeys.map((key, index) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={colors[index % colors.length]}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={colors[index % colors.length]}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [value.toLocaleString(), '']}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            fill={gradient ? `url(#gradient-${key})` : colors[index % colors.length]}
            fillOpacity={gradient ? 1 : 0.3}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsArea>
    </ResponsiveContainer>
  );
}
