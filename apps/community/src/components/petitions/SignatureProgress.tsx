'use client';

interface SignatureProgressProps {
  current: number;
  goal: number;
  compact?: boolean;
}

export function SignatureProgress({ current, goal, compact }: SignatureProgressProps) {
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-green-500'
              : progress >= 80
              ? 'bg-yellow-500'
              : 'bg-community-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className={`flex items-center justify-between ${compact ? 'mt-2' : ''}`}>
        <div>
          <span className={`font-bold ${compact ? 'text-lg' : 'text-2xl'} text-gray-900 dark:text-white`}>
            {current.toLocaleString()}
          </span>
          {!compact && (
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              of {goal.toLocaleString()} signatures
            </span>
          )}
        </div>
        <span className={`font-medium ${
          isComplete
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {Math.round(progress)}%
        </span>
      </div>
      {compact && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {goal.toLocaleString()} goal
        </div>
      )}
    </div>
  );
}
