'use client';

interface HeatmapProps {
  data: Array<{
    x: string;
    y: string;
    value: number;
  }>;
  xLabels: string[];
  yLabels: string[];
  colorScale?: {
    min: string;
    mid: string;
    max: string;
  };
  loading?: boolean;
  height?: number;
}

export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale = {
    min: '#EFF6FF',
    mid: '#60A5FA',
    max: '#1D4ED8',
  },
  loading = false,
  height = 300,
}: HeatmapProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse w-full h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  const getColor = (value: number): string => {
    const ratio = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);

    if (ratio < 0.5) {
      return interpolateColor(colorScale.min, colorScale.mid, ratio * 2);
    }
    return interpolateColor(colorScale.mid, colorScale.max, (ratio - 0.5) * 2);
  };

  const getValue = (x: string, y: string): number => {
    const cell = data.find((d) => d.x === x && d.y === y);
    return cell?.value ?? 0;
  };

  return (
    <div style={{ height }} className="overflow-auto">
      <div className="min-w-max">
        <div className="flex">
          <div className="w-16" /> {/* Corner space */}
          {xLabels.map((label) => (
            <div
              key={label}
              className="flex-1 min-w-12 text-xs text-gray-600 text-center py-2 font-medium"
            >
              {label}
            </div>
          ))}
        </div>
        {yLabels.map((yLabel) => (
          <div key={yLabel} className="flex items-center">
            <div className="w-16 text-xs text-gray-600 text-right pr-2 font-medium">
              {yLabel}
            </div>
            {xLabels.map((xLabel) => {
              const value = getValue(xLabel, yLabel);
              return (
                <div
                  key={`${xLabel}-${yLabel}`}
                  className="flex-1 min-w-12 h-10 flex items-center justify-center text-xs font-medium border border-white"
                  style={{
                    backgroundColor: getColor(value),
                    color: value > (maxValue + minValue) / 2 ? 'white' : '#374151',
                  }}
                  title={`${xLabel}, ${yLabel}: ${value}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (c: string) => parseInt(c.slice(1), 16);
  const r = (h: number) => (h >> 16) & 255;
  const g = (h: number) => (h >> 8) & 255;
  const b = (h: number) => h & 255;

  const h1 = hex(color1);
  const h2 = hex(color2);

  const nr = Math.round(r(h1) + (r(h2) - r(h1)) * ratio);
  const ng = Math.round(g(h1) + (g(h2) - g(h1)) * ratio);
  const nb = Math.round(b(h1) + (b(h2) - b(h1)) * ratio);

  return `rgb(${nr}, ${ng}, ${nb})`;
}
