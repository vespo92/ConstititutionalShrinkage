/**
 * Color utilities for charts
 */

// Default color palette
export const chartColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  pink: '#EC4899',
  lime: '#84CC16',
};

// Categorical color palette
export const categoricalColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#F97316', // Orange
];

// TBL colors
export const tblColors = {
  people: '#EC4899',
  planet: '#22C55E',
  profit: '#3B82F6',
};

/**
 * Get chart colors based on count
 */
export function getChartColors(count: number, palette = categoricalColors): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, ratio: number): string {
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

/**
 * Generate a gradient scale
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    colors.push(interpolateColor(startColor, endColor, ratio));
  }
  return colors;
}

/**
 * Get color for value on a scale
 */
export function getScaleColor(
  value: number,
  min: number,
  max: number,
  colors: { low: string; mid?: string; high: string }
): string {
  const ratio = (value - min) / (max - min);

  if (colors.mid) {
    if (ratio < 0.5) {
      return interpolateColor(colors.low, colors.mid, ratio * 2);
    }
    return interpolateColor(colors.mid, colors.high, (ratio - 0.5) * 2);
  }

  return interpolateColor(colors.low, colors.high, ratio);
}

/**
 * Adjust color brightness
 */
export function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get contrasting text color (black or white) for a background
 */
export function getContrastColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
