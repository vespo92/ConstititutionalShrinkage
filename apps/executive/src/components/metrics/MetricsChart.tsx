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
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TBLDataPoint {
  date: string;
  people: number;
  planet: number;
  profit: number;
}

interface MetricsChartProps {
  data: TBLDataPoint[];
  type?: 'line' | 'area';
  showLegend?: boolean;
  height?: number;
}

const COLORS = {
  people: '#22c55e',
  planet: '#3b82f6',
  profit: '#f59e0b',
};

export function MetricsChart({
  data,
  type = 'line',
  showLegend = true,
  height = 300,
}: MetricsChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="gradientPeople" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.people} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.people} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientPlanet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.planet} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.planet} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="people"
            name="People"
            stroke={COLORS.people}
            fill="url(#gradientPeople)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="planet"
            name="Planet"
            stroke={COLORS.planet}
            fill="url(#gradientPlanet)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke={COLORS.profit}
            fill="url(#gradientProfit)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="people"
          name="People"
          stroke={COLORS.people}
          strokeWidth={2}
          dot={{ fill: COLORS.people, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="planet"
          name="Planet"
          stroke={COLORS.planet}
          strokeWidth={2}
          dot={{ fill: COLORS.planet, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke={COLORS.profit}
          strokeWidth={2}
          dot={{ fill: COLORS.profit, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default MetricsChart;
