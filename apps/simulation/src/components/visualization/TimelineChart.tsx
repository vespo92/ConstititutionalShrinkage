'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

interface TimelineData {
  timestamps: string[];
  values: number[];
  confidenceLower: number[];
  confidenceUpper: number[];
}

interface TimelineChartProps {
  data: TimelineData;
  title?: string;
  dimension: 'people' | 'planet' | 'profit';
  showConfidence?: boolean;
}

export default function TimelineChart({
  data,
  title,
  dimension,
  showConfidence = true
}: TimelineChartProps) {
  const colors = {
    people: { main: '#f59e0b', light: '#fef3c7' },
    planet: { main: '#10b981', light: '#d1fae5' },
    profit: { main: '#3b82f6', light: '#dbeafe' }
  };

  const chartData = data.timestamps.map((timestamp, index) => ({
    year: new Date(timestamp).getFullYear(),
    value: data.values[index],
    lower: data.confidenceLower[index],
    upper: data.confidenceUpper[index]
  }));

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis domain={[-100, 100]} />
          <Tooltip
            formatter={(value: number) => [value.toFixed(1), 'Score']}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend />
          {showConfidence && (
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill={colors[dimension].light}
              fillOpacity={0.5}
              name="Confidence"
            />
          )}
          {showConfidence && (
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="white"
              fillOpacity={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[dimension].main}
            strokeWidth={2}
            dot={{ fill: colors[dimension].main }}
            name={dimension.charAt(0).toUpperCase() + dimension.slice(1)}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
