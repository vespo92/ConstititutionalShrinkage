'use client';

import {
  ResponsiveContainer,
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartProps, defaultTheme } from '../types';

export interface LineChartProps extends ChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  showGrid?: boolean;
  showLegend?: boolean;
  curved?: boolean;
  showDots?: boolean;
}

export function LineChart({
  data,
  xKey,
  yKey,
  color = defaultTheme.colors.primary,
  loading = false,
  height = 300,
  showGrid = true,
  showLegend = false,
  curved = true,
  showDots = false,
  className,
}: LineChartProps) {
  if (loading) {
    return (
      <div className={className} style={{ height }}>
        <div className="animate-pulse flex flex-col h-full">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex-1 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const colors = Array.isArray(color) ? color : [color];

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <RechartsLine data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray={defaultTheme.grid.strokeDasharray}
            stroke={defaultTheme.grid.stroke}
          />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: defaultTheme.fonts.sizes.axis, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tick={{ fontSize: defaultTheme.fonts.sizes.axis, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: defaultTheme.tooltip.background,
            border: `1px solid ${defaultTheme.tooltip.border}`,
            borderRadius: defaultTheme.tooltip.borderRadius,
            boxShadow: defaultTheme.tooltip.shadow,
          }}
          formatter={(value: number) => [value.toLocaleString(), '']}
        />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type={curved ? 'monotone' : 'linear'}
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={showDots}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
}
