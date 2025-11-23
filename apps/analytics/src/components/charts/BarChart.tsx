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

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  loading?: boolean;
  height?: number;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = '#3B82F6',
  loading = false,
  height = 300,
  horizontal = false,
  showGrid = true,
  showLegend = false,
  stacked = false,
}: BarChartProps) {
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

  const layout = horizontal ? 'vertical' : 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: horizontal ? 80 : 0, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
          </>
        ) : (
          <>
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
          </>
        )}
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
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
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
