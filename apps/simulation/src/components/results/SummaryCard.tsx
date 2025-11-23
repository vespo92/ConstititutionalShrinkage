'use client';

import { Users, TreePine, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface SummaryCardProps {
  dimension: 'people' | 'planet' | 'profit';
  score: number;
  confidence: [number, number];
  additionalMetric?: {
    label: string;
    value: string | number;
  };
}

export default function SummaryCard({
  dimension,
  score,
  confidence,
  additionalMetric
}: SummaryCardProps) {
  const config = {
    people: {
      icon: Users,
      label: 'People',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    planet: {
      icon: TreePine,
      label: 'Planet',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    profit: {
      icon: TrendingUp,
      label: 'Profit',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  };

  const { icon: Icon, label, bgColor, iconColor, borderColor } = config[dimension];

  const getScoreColor = (score: number) => {
    if (score > 20) return 'text-green-600';
    if (score < -20) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreIcon = (score: number) => {
    if (score > 10) return <ArrowUp className="w-5 h-5 text-green-500" />;
    if (score < -10) return <ArrowDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="ml-3 text-lg font-semibold text-gray-900">{label}</h3>
        </div>
        {getScoreIcon(score)}
      </div>

      <div className="mb-4">
        <p className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score > 0 ? '+' : ''}{Math.round(score)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          95% CI: [{Math.round(confidence[0])}, {Math.round(confidence[1])}]
        </p>
      </div>

      {additionalMetric && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">{additionalMetric.label}</p>
          <p className="text-lg font-semibold text-gray-900">{additionalMetric.value}</p>
        </div>
      )}
    </div>
  );
}
