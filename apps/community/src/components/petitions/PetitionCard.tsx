'use client';

import { Users, Clock, MapPin, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SignatureProgress } from './SignatureProgress';
import { Petition } from '@/lib/types';

interface PetitionCardProps {
  petition: Petition;
}

export function PetitionCard({ petition }: PetitionCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    successful: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <a
      href={`/petitions/${petition.id}`}
      className="block bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[petition.status]}`}>
          {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
        </span>
        {petition.responseRequired && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs">
            Response Required
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {petition.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {petition.description}
      </p>

      {/* Progress */}
      <SignatureProgress
        current={petition.signatures}
        goal={petition.goal}
        compact
      />

      {/* Meta */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {petition.region}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
          </span>
        </div>
        {petition.status === 'active' && petition.progress >= 80 && (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}
      </div>
    </a>
  );
}
