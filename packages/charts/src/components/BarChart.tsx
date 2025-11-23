'use client';

import {
  ResponsiveContainer,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { ChartProps, defaultTheme } from '../types';

export interface BarChartProps extends ChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  rounded?: boolean;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = defaultTheme.colors.primary,
  loading = false,
  height = 300,
  horizontal = false,
  showGrid = true,
  showLegend = false,
  stacked = false,
  rounded = true,
  className,
}: BarChartProps) {
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
  const layout = horizontal ? 'vertical' : 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <RechartsBar
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: horizontal ? 80 : 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray={defaultTheme.grid.strokeDasharray}
            stroke={defaultTheme.grid.stroke}
          />
        )}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: defaultTheme.fonts.sizes.axis, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: defaultTheme.fonts.sizes.axis, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={rounded ? [4, 4, 0, 0] : undefined}
            stackId={stacked ? 'stack' : undefined}
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Bar>
        ))}
      </RechartsBar>
    </ResponsiveContainer>
  );
}
