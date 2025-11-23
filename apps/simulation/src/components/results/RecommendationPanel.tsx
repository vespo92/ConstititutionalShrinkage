'use client';

import { AlertTriangle, Lightbulb, Rocket } from 'lucide-react';

interface Recommendation {
  type: 'warning' | 'suggestion' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  relatedFactors: string[];
}

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  title?: string;
}

export default function RecommendationPanel({
  recommendations,
  title = 'Recommendations'
}: RecommendationPanelProps) {
  const config = {
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800'
    },
    suggestion: {
      icon: Lightbulb,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800'
    },
    opportunity: {
      icon: Rocket,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800'
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[rec.type];

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}
            >
              <div className="flex items-start">
                <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                <div className="ml-3 flex-1">
                  <h4 className={`font-medium ${textColor}`}>{rec.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{rec.description}</p>
                  {rec.relatedFactors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rec.relatedFactors.map((factor, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Confidence: {Math.round(rec.confidence * 100)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
