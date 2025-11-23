'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SensitivityResult {
  parameter: string;
  baseValue: number;
  range: [number, number];
  impactOnPeople: number;
  impactOnPlanet: number;
  impactOnProfit: number;
  elasticity: number;
}

interface SensitivityPlotProps {
  data: SensitivityResult[];
  title?: string;
  dimension?: 'overall' | 'people' | 'planet' | 'profit';
}

export default function SensitivityPlot({
  data,
  title = 'Sensitivity Analysis (Tornado Diagram)',
  dimension = 'overall'
}: SensitivityPlotProps) {
  const chartData = data.map(item => {
    let impact: number;
    switch (dimension) {
      case 'people':
        impact = item.impactOnPeople;
        break;
      case 'planet':
        impact = item.impactOnPlanet;
        break;
      case 'profit':
        impact = item.impactOnProfit;
        break;
      default:
        impact = (item.impactOnPeople + item.impactOnPlanet + item.impactOnProfit) / 3;
    }

    return {
      parameter: formatParameterName(item.parameter),
      impact: impact,
      elasticity: item.elasticity
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[-50, 50]} />
          <YAxis type="category" dataKey="parameter" width={140} />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), 'Impact']}
          />
          <Bar dataKey="impact" name="Impact">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.impact >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatParameterName(path: string): string {
  const name = path.split('.').pop() || path;
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
