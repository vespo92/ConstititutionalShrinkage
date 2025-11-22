'use client';

import type { ImpactAssessment } from '@/lib/types';

interface ImpactPredictorProps {
  assessment: ImpactAssessment;
}

export default function ImpactPredictor({ assessment }: ImpactPredictorProps) {
  const { prediction, confidence, methodology, keyFactors } = assessment;

  const categories = [
    { key: 'people', label: 'People', color: 'blue', icon: '&#128101;' },
    { key: 'planet', label: 'Planet', color: 'green', icon: '&#127757;' },
    { key: 'profit', label: 'Prosperity', color: 'yellow', icon: '&#128176;' },
  ] as const;

  const timeframes = [
    { key: 'shortTerm', label: 'Short Term (1 year)', data: prediction.shortTerm },
    { key: 'mediumTerm', label: 'Medium Term (5 years)', data: prediction.mediumTerm },
    { key: 'longTerm', label: 'Long Term (10 years)', data: prediction.longTerm },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (score: number, category: string) => {
    const colors: Record<string, string> = {
      people: 'bg-blue-500',
      planet: 'bg-green-500',
      profit: 'bg-yellow-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Triple Bottom Line Impact Analysis
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Projected impact on People, Planet, and Prosperity
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Model Confidence</div>
          <div className={`text-2xl font-bold ${getScoreColor(confidence * 100)}`}>
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeframes.map((timeframe) => (
          <div
            key={timeframe.key}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <h4 className="font-medium text-gray-700 mb-3">{timeframe.label}</h4>

            {/* Category Scores */}
            <div className="space-y-3">
              {categories.map((cat) => {
                const score = timeframe.data[cat.key];
                const uncertainty = prediction.uncertainty[cat.key];

                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        <span
                          className="mr-2"
                          dangerouslySetInnerHTML={{ __html: cat.icon }}
                        />
                        {cat.label}
                      </span>
                      <span className={`font-medium ${getScoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getBarColor(score, cat.key)} transition-all`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {/* Uncertainty Range */}
                      <div
                        className="absolute top-0 h-2 border-l-2 border-r-2 border-gray-400 opacity-30"
                        style={{
                          left: `${uncertainty.min}%`,
                          width: `${uncertainty.max - uncertainty.min}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Range: {uncertainty.min} - {uncertainty.max}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composite Score */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Composite Score
                </span>
                <span
                  className={`text-xl font-bold ${getScoreColor(
                    timeframe.data.composite
                  )}`}
                >
                  {timeframe.data.composite}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Methodology & Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Methodology */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Methodology</h4>
          <p className="text-sm text-blue-800">{methodology}</p>
        </div>

        {/* Key Factors */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Key Factors</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {keyFactors.map((factor, index) => (
              <li key={index} className="flex items-center">
                <span className="text-gray-400 mr-2">&bull;</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">
          Assumptions (Impact May Vary)
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          {prediction.assumptions.map((assumption, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-600 mr-2">&#9888;</span>
              {assumption}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        This analysis is generated by AI models and should be considered one
        input among many in the democratic decision-making process. Actual
        outcomes may vary significantly from predictions.
      </p>
    </div>
  );
}
