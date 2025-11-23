'use client';

import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  donut?: boolean;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

export function PieChart({
  data,
  loading = false,
  height = 300,
  showLegend = true,
  donut = true,
}: PieChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse">
          <div className="h-48 w-48 rounded-full bg-gray-100"></div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? 60 : 0}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || COLORS[index % COLORS.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
