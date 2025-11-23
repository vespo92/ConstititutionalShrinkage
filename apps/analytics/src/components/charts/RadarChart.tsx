'use client';

import {
  ResponsiveContainer,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

interface RadarChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  nameKey: string;
  series?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  color?: string;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
}

export function RadarChart({
  data,
  dataKey,
  nameKey,
  series,
  color = '#3B82F6',
  loading = false,
  height = 300,
  showLegend = true,
}: RadarChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse">
          <div className="h-48 w-48 rounded-full bg-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey={nameKey}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        {series ? (
          series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))
        ) : (
          <Radar
            name="Value"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        )}
        {showLegend && <Legend />}
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
