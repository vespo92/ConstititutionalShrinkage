'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  vertical?: boolean;
}

export function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  vertical = true,
}: VoteButtonsProps) {
  const score = upvotes - downvotes;

  return (
    <div className={`flex ${vertical ? 'flex-col' : ''} items-center gap-1`}>
      <button
        onClick={() => onVote('up')}
        className={`p-2 rounded-lg transition-colors ${
          userVote === 'up'
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700'
        }`}
        title="Upvote"
      >
        <ThumbsUp className="w-5 h-5" />
      </button>

      <span
        className={`text-lg font-bold ${
          score > 0
            ? 'text-green-600 dark:text-green-400'
            : score < 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {score}
      </span>

      <button
        onClick={() => onVote('down')}
        className={`p-2 rounded-lg transition-colors ${
          userVote === 'down'
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700'
        }`}
        title="Downvote"
      >
        <ThumbsDown className="w-5 h-5" />
      </button>
    </div>
  );
}
