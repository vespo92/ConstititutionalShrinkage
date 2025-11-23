'use client';

import { Hand } from 'lucide-react';

interface HandRaiseProps {
  isRaised: boolean;
  onToggle: () => void;
}

export function HandRaise({ isRaised, onToggle }: HandRaiseProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
        isRaised
          ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400 animate-pulse'
          : 'bg-slate-700 text-white hover:bg-slate-600'
      }`}
    >
      <Hand className={`w-5 h-5 ${isRaised ? 'animate-bounce' : ''}`} />
      {isRaised ? 'Hand Raised' : 'Raise Hand'}
    </button>
  );
}
