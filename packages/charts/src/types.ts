/**
 * Shared chart types
 */

export interface ChartProps {
  width?: number | string;
  height?: number;
  loading?: boolean;
  className?: string;
}

export interface ChartData {
  [key: string]: string | number | Date | null | undefined;
}

export interface TimeSeriesData {
  date: string | Date;
  value: number;
  [key: string]: any;
}

export interface CategoryData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface ChartTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    gray: string[];
  };
  fonts: {
    family: string;
    sizes: {
      label: number;
      axis: number;
      title: number;
    };
  };
  grid: {
    stroke: string;
    strokeDasharray: string;
  };
  tooltip: {
    background: string;
    border: string;
    borderRadius: number;
    shadow: string;
  };
}

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

export interface LegendProps {
  payload?: Array<{
    value: string;
    type: string;
    id: string;
    color: string;
  }>;
}

export const defaultTheme: ChartTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937'],
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
    stroke: '#E5E7EB',
    strokeDasharray: '3 3',
  },
  tooltip: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    borderRadius: 8,
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
};
