'use client';

import { ChartProps } from '../types';
import { interpolateColor } from '../utils/colors';

export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

export interface HeatmapProps extends ChartProps {
  data: HeatmapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: {
    min: string;
    mid: string;
    max: string;
  };
  showValues?: boolean;
  cellSize?: number;
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
  showValues = true,
  cellSize,
  className,
}: HeatmapProps) {
  if (loading) {
    return (
      <div className={className} style={{ height }}>
        <div className="animate-pulse w-full h-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);

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
    <div className={className} style={{ height, overflow: 'auto' }}>
      <div className="min-w-max">
        {/* X-axis labels */}
        <div className="flex">
          <div className="w-16 shrink-0" />
          {xLabels.map((label) => (
            <div
              key={label}
              className="flex-1 min-w-12 text-xs text-gray-600 text-center py-2 font-medium"
              style={cellSize ? { width: cellSize, minWidth: cellSize } : undefined}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {yLabels.map((yLabel) => (
          <div key={yLabel} className="flex items-center">
            <div className="w-16 shrink-0 text-xs text-gray-600 text-right pr-2 font-medium">
              {yLabel}
            </div>
            {xLabels.map((xLabel) => {
              const value = getValue(xLabel, yLabel);
              const bgColor = getColor(value);
              const textColor = value > (maxValue + minValue) / 2 ? 'white' : '#374151';

              return (
                <div
                  key={`${xLabel}-${yLabel}`}
                  className="flex-1 min-w-12 h-10 flex items-center justify-center text-xs font-medium border border-white cursor-default transition-transform hover:scale-105"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    ...(cellSize ? { width: cellSize, minWidth: cellSize } : {}),
                  }}
                  title={`${xLabel}, ${yLabel}: ${value}`}
                >
                  {showValues && value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
