'use client';

import { useMemo } from 'react';
import { ChartTheme, defaultTheme } from '../types';

export interface UseChartThemeOptions {
  darkMode?: boolean;
  customColors?: Partial<ChartTheme['colors']>;
}

const darkTheme: ChartTheme = {
  colors: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    gray: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#F9FAFB'],
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    sizes: {
      label: 12,
      axis: 11,
      title: 14,
    },
  },
  grid: {
    stroke: '#374151',
    strokeDasharray: '3 3',
  },
  tooltip: {
    background: '#1F2937',
    border: '#374151',
    borderRadius: 8,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },
};

export function useChartTheme(options: UseChartThemeOptions = {}): ChartTheme {
  const { darkMode = false, customColors } = options;

  return useMemo(() => {
    const baseTheme = darkMode ? darkTheme : defaultTheme;

    if (!customColors) {
      return baseTheme;
    }

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...customColors,
      },
    };
  }, [darkMode, customColors]);
}
