'use client';

import type { ConstitutionalCheckResult } from '@/lib/types';

interface ConstitutionalCheckProps {
  result: ConstitutionalCheckResult;
  compact?: boolean;
}

export default function ConstitutionalCheck({
  result,
  compact = false,
}: ConstitutionalCheckProps) {
  const { isConstitutional, violations, warnings, score } = result;

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-2 ${
          isConstitutional ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <span className="text-lg">
          {isConstitutional ? '\u2713' : '\u2717'}
        </span>
        <span className="text-sm font-medium">
          {isConstitutional ? 'Constitutional' : 'Issues Detected'}
        </span>
        <span className="text-xs text-gray-500">({score}% compliant)</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              isConstitutional
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {isConstitutional ? '\u2713' : '\u2717'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Constitutional Compliance
            </h3>
            <p className="text-sm text-gray-500">
              {isConstitutional
                ? 'This bill passes constitutional review'
                : 'This bill has constitutional issues'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{score}%</div>
          <div className="text-sm text-gray-500">Compliance Score</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 80
              ? 'bg-green-500'
              : score >= 60
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-3">
            Violations ({violations.length})
          </h4>
          <div className="space-y-3">
            {violations.map((violation, index) => (
              <div
                key={index}
                className="bg-white rounded p-3 border border-red-100"
              >
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">&#9888;</span>
                  <div>
                    <p className="font-medium text-red-900">
                      {violation.rightTitle}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {violation.description}
                    </p>
                    {violation.suggestedFix && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        Suggestion: {violation.suggestedFix}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-3">
            Warnings ({warnings.length})
          </h4>
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="bg-white rounded p-3 border border-yellow-100"
              >
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-2">&#9888;</span>
                  <div>
                    <p className="font-medium text-yellow-900">
                      {warning.rightTitle}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {warning.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Recommendation: {warning.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clear */}
      {violations.length === 0 && warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 text-2xl mr-3">&#10004;</span>
            <div>
              <p className="font-medium text-green-900">
                No constitutional issues detected
              </p>
              <p className="text-sm text-green-700">
                This bill appears to be fully compliant with constitutional
                rights and protections.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
