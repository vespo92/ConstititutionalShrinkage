'use client';

import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { LocalLegislation } from '@/types';
import { formatDate, formatRelativeTime, calculateVotePercentage, isVotingOpen } from '@/lib/utils';
import { legislationStatusLabels } from '@/lib/mock-data';

interface LegislationCardProps {
  legislation: LocalLegislation;
  showPod?: boolean;
}

const statusIcons = {
  draft: FileText,
  review: AlertCircle,
  voting: Clock,
  passed: CheckCircle,
  rejected: XCircle,
  enacted: CheckCircle,
  repealed: XCircle,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  voting: 'bg-blue-100 text-blue-700',
  passed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  enacted: 'bg-green-100 text-green-700',
  repealed: 'bg-gray-100 text-gray-700',
};

const scopeColors: Record<string, string> = {
  local: 'bg-purple-100 text-purple-700',
  regional: 'bg-blue-100 text-blue-700',
  inter_pod: 'bg-amber-100 text-amber-700',
  state: 'bg-green-100 text-green-700',
};

export default function LegislationCard({ legislation, showPod = true }: LegislationCardProps) {
  const Icon = statusIcons[legislation.status] || FileText;
  const votePercentages = calculateVotePercentage(legislation.votes);
  const totalVotes = legislation.votes.for + legislation.votes.against + legislation.votes.abstain;

  return (
    <Link
      href={`/legislation/${legislation.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-pod-green-300 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{legislation.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{legislation.summary}</p>
          </div>
          <div className="flex flex-col items-end space-y-1 ml-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[legislation.status]}`}>
              {legislationStatusLabels[legislation.status]}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${scopeColors[legislation.scope]}`}>
              {legislation.scope.replace('_', '-')}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
          <span>Sponsor: {legislation.sponsor}</span>
          {showPod && <span>Pod: {legislation.podName}</span>}
        </div>

        {/* Voting Progress (if in voting) */}
        {legislation.status === 'voting' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">
                {totalVotes.toLocaleString()} votes
              </span>
              {legislation.votingEnds && (
                <span className={isVotingOpen(legislation.votingEnds) ? 'text-blue-600' : 'text-gray-400'}>
                  {isVotingOpen(legislation.votingEnds)
                    ? `Ends ${formatRelativeTime(legislation.votingEnds)}`
                    : 'Voting closed'}
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${votePercentages.forPercent}%` }}
              />
              <div
                className="bg-red-500 h-full"
                style={{ width: `${votePercentages.againstPercent}%` }}
              />
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${votePercentages.abstainPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-green-600">{votePercentages.forPercent}% For</span>
              <span className="text-red-600">{votePercentages.againstPercent}% Against</span>
            </div>
          </div>
        )}

        {/* Constitutional Compliance */}
        {legislation.constitutionalCompliance && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Constitutional Compliance</span>
            <div className={`flex items-center ${legislation.constitutionalCompliance.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
              {legislation.constitutionalCompliance.isCompliant ? (
                <CheckCircle size={16} className="mr-1" />
              ) : (
                <XCircle size={16} className="mr-1" />
              )}
              <span className="text-sm font-medium">{legislation.constitutionalCompliance.score}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        Introduced {formatDate(legislation.introducedAt)}
      </div>
    </Link>
  );
}
