'use client';

import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartProps, CategoryData, defaultTheme } from '../types';

const DEFAULT_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#84CC16',
];

export interface PieChartProps extends ChartProps {
  data: CategoryData[];
  showLegend?: boolean;
  donut?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}

export function PieChart({
  data,
  loading = false,
  height = 300,
  showLegend = true,
  donut = true,
  innerRadius = 60,
  outerRadius = 80,
  showLabels = true,
  className,
}: PieChartProps) {
  if (loading) {
    return (
      <div className={className} style={{ height }}>
        <div className="animate-pulse flex items-center justify-center h-full">
          <div className="h-48 w-48 rounded-full bg-gray-100"></div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? innerRadius : 0}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={
            showLabels
              ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`
              : undefined
          }
          labelLine={showLabels ? { stroke: '#9CA3AF', strokeWidth: 1 } : false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: defaultTheme.tooltip.background,
            border: `1px solid ${defaultTheme.tooltip.border}`,
            borderRadius: defaultTheme.tooltip.borderRadius,
            boxShadow: defaultTheme.tooltip.shadow,
          }}
          formatter={(value: number) => [
            `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
            '',
          ]}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-gray-700">{value}</span>}
          />
        )}
      </RechartsPie>
    </ResponsiveContainer>
  );
}
