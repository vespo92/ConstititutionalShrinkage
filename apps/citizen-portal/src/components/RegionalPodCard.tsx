'use client';

import { MapPin, Users, FileText, TrendingUp, Plus, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Region {
  id: string;
  name: string;
  type: string;
  population: number | null;
  activeCitizens: number;
  activeBills: number;
  participationRate: number;
  isJoined: boolean;
  description: string;
}

export function RegionalPodCard({ region }: { region: Region }) {
  const typeColors: Record<string, string> = {
    Federal: 'bg-governance-vote/10 text-governance-vote',
    State: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600',
    'Metropolitan Pod': 'bg-governance-civic/10 text-governance-civic',
    'Interest Pod': 'bg-governance-delegate/10 text-governance-delegate',
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${typeColors[region.type] || 'bg-gray-100 text-gray-600'}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {region.name}
            </h3>
            <span className="text-xs text-gray-500">{region.type}</span>
          </div>
        </div>
        {region.isJoined ? (
          <span className="badge badge-civic flex items-center gap-1">
            <Check className="h-3 w-3" />
            Joined
          </span>
        ) : (
          <button className="badge bg-primary-100 dark:bg-primary-900/20 text-primary-600 flex items-center gap-1 hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors cursor-pointer">
            <Plus className="h-3 w-3" />
            Join
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {region.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {region.population && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber(region.population)}
              </span>
              <span className="text-gray-500 ml-1">population</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatNumber(region.activeCitizens)}
            </span>
            <span className="text-gray-500 ml-1">citizens</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {region.activeBills}
            </span>
            <span className="text-gray-500 ml-1">active bills</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {region.participationRate}%
            </span>
            <span className="text-gray-500 ml-1">participation</span>
          </div>
        </div>
      </div>

      {/* Participation Bar */}
      <div className="mb-4">
        <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-governance-civic rounded-full"
            style={{ width: `${region.participationRate}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
        <Link
          href={`/regions/${region.id}`}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View Details <ExternalLink className="h-3 w-3" />
        </Link>
        <Link
          href={`/regions/${region.id}/bills`}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Browse Bills
        </Link>
      </div>
    </div>
  );
}
