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

interface LineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string | string[];
  color?: string | string[];
  loading?: boolean;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function LineChart({
  data,
  xKey,
  yKey,
  color = '#3B82F6',
  loading = false,
  height = 300,
  showGrid = true,
  showLegend = false,
}: LineChartProps) {
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
      <RechartsLine data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
}
