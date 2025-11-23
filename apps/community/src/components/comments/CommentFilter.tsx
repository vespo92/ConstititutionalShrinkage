'use client';

import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

interface CommentFilterProps {
  value: 'all' | 'support' | 'oppose' | 'neutral';
  onChange: (value: 'all' | 'support' | 'oppose' | 'neutral') => void;
}

export function CommentFilter({ value, onChange }: CommentFilterProps) {
  const options = [
    { id: 'all', label: 'All' },
    { id: 'support', label: 'Support', icon: ThumbsUp },
    { id: 'oppose', label: 'Oppose', icon: ThumbsDown },
    { id: 'neutral', label: 'Neutral', icon: Minus },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id as typeof value)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
            value === option.id
              ? 'bg-community-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {option.icon && <option.icon className="w-3 h-3" />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
