import type { TBLScore, TBLCategory, KPI } from '@/types';

export function calculateOverallTBL(score: TBLScore): number {
  const { people, planet, profit } = score;
  // Equal weighting for all three categories
  return Math.round((people.score + planet.score + profit.score) / 3);
}

export function calculateCategoryScore(components: Record<string, number>): number {
  const values = Object.values(components);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
}

export function getTrendFromHistory(
  current: number,
  previous: number
): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  const threshold = 1; // 1% threshold for stability

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

export function getTrendPercentage(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function formatTBLCategory(category: TBLCategory): {
  score: string;
  trend: string;
  components: { name: string; value: string }[];
} {
  return {
    score: `${category.score}%`,
    trend: category.trend === 'up' ? '+' : category.trend === 'down' ? '-' : '=',
    components: Object.entries(category.components).map(([name, value]) => ({
      name: formatComponentName(name),
      value: `${value}%`,
    })),
  };
}

export function formatComponentName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getKPIStatus(kpi: KPI): 'on_track' | 'at_risk' | 'off_track' {
  const percentageOfTarget = (kpi.value / kpi.target) * 100;

  if (percentageOfTarget >= 90) return 'on_track';
  if (percentageOfTarget >= 70) return 'at_risk';
  return 'off_track';
}

export function getKPIStatusColor(status: 'on_track' | 'at_risk' | 'off_track'): string {
  switch (status) {
    case 'on_track':
      return 'text-green-600';
    case 'at_risk':
      return 'text-yellow-600';
    case 'off_track':
      return 'text-red-600';
  }
}

export function getChartColors(category: 'people' | 'planet' | 'profit'): {
  primary: string;
  secondary: string;
  gradient: string[];
} {
  switch (category) {
    case 'people':
      return {
        primary: '#22c55e',
        secondary: '#166534',
        gradient: ['#dcfce7', '#22c55e'],
      };
    case 'planet':
      return {
        primary: '#3b82f6',
        secondary: '#1e40af',
        gradient: ['#dbeafe', '#3b82f6'],
      };
    case 'profit':
      return {
        primary: '#f59e0b',
        secondary: '#b45309',
        gradient: ['#fef3c7', '#f59e0b'],
      };
  }
}

export function generateMockTBLData(months: number): {
  date: string;
  people: number;
  planet: number;
  profit: number;
}[] {
  const data: { date: string; people: number; planet: number; profit: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7);

    // Generate realistic-looking data with some variation
    const baseScore = 70 + Math.random() * 15;
    data.push({
      date: monthStr,
      people: Math.round(baseScore + Math.random() * 10 - 5),
      planet: Math.round(baseScore + Math.random() * 10 - 5),
      profit: Math.round(baseScore + Math.random() * 10 - 5),
    });
  }

  return data;
}

export function generateMockKPIs(): KPI[] {
  return [
    {
      id: 'kpi-1',
      name: 'Policy Completion Rate',
      value: 78,
      unit: '%',
      target: 85,
      trend: 'up',
      trendPercentage: 5.2,
      category: 'general',
    },
    {
      id: 'kpi-2',
      name: 'Citizen Satisfaction',
      value: 72,
      unit: '%',
      target: 80,
      trend: 'up',
      trendPercentage: 3.1,
      category: 'people',
    },
    {
      id: 'kpi-3',
      name: 'Carbon Reduction',
      value: 15,
      unit: '%',
      target: 20,
      trend: 'up',
      trendPercentage: 8.4,
      category: 'planet',
    },
    {
      id: 'kpi-4',
      name: 'Budget Utilization',
      value: 92,
      unit: '%',
      target: 95,
      trend: 'stable',
      trendPercentage: 0.5,
      category: 'profit',
    },
    {
      id: 'kpi-5',
      name: 'Active Policies',
      value: 24,
      unit: '',
      target: 30,
      trend: 'up',
      trendPercentage: 12.0,
      category: 'general',
    },
    {
      id: 'kpi-6',
      name: 'Emergency Response Time',
      value: 12,
      unit: 'min',
      target: 15,
      trend: 'down',
      trendPercentage: -8.0,
      category: 'general',
    },
  ];
}
