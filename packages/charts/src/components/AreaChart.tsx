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
import { ChartProps, defaultTheme } from '../types';

export interface AreaChartProps extends ChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  gradient?: boolean;
}

export function AreaChart({
  data,
  xKey,
  yKey,
  color = defaultTheme.colors.primary,
  loading = false,
  height = 300,
  showGrid = true,
  showLegend = false,
  stacked = false,
  gradient = true,
  className,
}: AreaChartProps) {
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
