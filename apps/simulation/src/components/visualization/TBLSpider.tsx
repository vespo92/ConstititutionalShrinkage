'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

interface TBLSpiderProps {
  data: {
    people: number;
    planet: number;
    profit: number;
  };
  comparisonData?: {
    people: number;
    planet: number;
    profit: number;
    label: string;
  };
  title?: string;
}

export default function TBLSpider({ data, comparisonData, title }: TBLSpiderProps) {
  const chartData = [
    {
      dimension: 'People',
      current: Math.max(0, data.people + 100) / 2, // Normalize -100 to 100 -> 0 to 100
      comparison: comparisonData ? Math.max(0, comparisonData.people + 100) / 2 : undefined,
      fullMark: 100
    },
    {
      dimension: 'Planet',
      current: Math.max(0, data.planet + 100) / 2,
      comparison: comparisonData ? Math.max(0, comparisonData.planet + 100) / 2 : undefined,
      fullMark: 100
    },
    {
      dimension: 'Profit',
      current: Math.max(0, data.profit + 100) / 2,
      comparison: comparisonData ? Math.max(0, comparisonData.profit + 100) / 2 : undefined,
      fullMark: 100
    }
  ];

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Current Policy"
            dataKey="current"
            stroke="#2a93ff"
            fill="#2a93ff"
            fillOpacity={0.4}
          />
          {comparisonData && (
            <Radar
              name={comparisonData.label}
              dataKey="comparison"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
            />
          )}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
