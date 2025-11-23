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
import { ChartProps, defaultTheme } from '../types';

export interface RadarSeries {
  key: string;
  name: string;
  color: string;
}

export interface RadarChartProps extends ChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  nameKey: string;
  series?: RadarSeries[];
  color?: string;
  showLegend?: boolean;
  domain?: [number, number];
}

export function RadarChart({
  data,
  dataKey,
  nameKey,
  series,
  color = defaultTheme.colors.primary,
  loading = false,
  height = 300,
  showLegend = true,
  domain = [0, 100],
  className,
}: RadarChartProps) {
  if (loading) {
    return (
      <div className={className} style={{ height }}>
        <div className="animate-pulse flex items-center justify-center h-full">
          <div className="h-48 w-48 rounded-full bg-gray-100"></div>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <RechartsRadar data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey={nameKey}
          tick={{ fontSize: defaultTheme.fonts.sizes.axis, fill: '#6B7280' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={domain}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: defaultTheme.tooltip.background,
            border: `1px solid ${defaultTheme.tooltip.border}`,
            borderRadius: defaultTheme.tooltip.borderRadius,
            boxShadow: defaultTheme.tooltip.shadow,
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
