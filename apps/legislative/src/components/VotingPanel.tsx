'use client';

import { useState } from 'react';
import { castVote } from '@/lib/api';
import type { Bill, VoteResults } from '@/lib/types';

interface VotingPanelProps {
  bill: Bill;
  onVoteUpdate?: (newVotes: VoteResults) => void;
}

export default function VotingPanel({ bill, onVoteUpdate }: VotingPanelProps) {
  const [selectedChoice, setSelectedChoice] = useState<'for' | 'against' | 'abstain' | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (!selectedChoice) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const newVotes = await castVote({
        billId: bill.id,
        choice: selectedChoice,
        isPublic,
      });

      setHasVoted(true);
      onVoteUpdate?.(newVotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = bill.votes.for + bill.votes.against + bill.votes.abstain;
  const forPercent = totalVotes > 0 ? (bill.votes.for / totalVotes) * 100 : 0;
  const againstPercent = totalVotes > 0 ? (bill.votes.against / totalVotes) * 100 : 0;
  const abstainPercent = totalVotes > 0 ? (bill.votes.abstain / totalVotes) * 100 : 0;

  // Quorum progress (mock - would be calculated from actual eligible voters)
  const quorumTarget = 1000;
  const quorumProgress = Math.min((totalVotes / quorumTarget) * 100, 100);

  if (hasVoted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-green-500 text-3xl mr-4">&#10004;</span>
          <div>
            <h3 className="font-semibold text-green-900">Vote Recorded</h3>
            <p className="text-green-700">
              Thank you for participating in democracy! Your vote has been
              cryptographically verified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-indigo-900 mb-4">
        Cast Your Vote
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-300 rounded p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Current Results */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Results</span>
          <span className="text-sm text-gray-500">{totalVotes} votes cast</span>
        </div>

        {/* Results Bar */}
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${forPercent}%` }}
          />
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${againstPercent}%` }}
          />
          <div
            className="bg-gray-400 transition-all"
            style={{ width: `${abstainPercent}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-green-600">
            For: {bill.votes.for} ({forPercent.toFixed(1)}%)
          </span>
          <span className="text-red-600">
            Against: {bill.votes.against} ({againstPercent.toFixed(1)}%)
          </span>
          <span className="text-gray-500">
            Abstain: {bill.votes.abstain} ({abstainPercent.toFixed(1)}%)
          </span>
        </div>

        {/* Quorum Progress */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Quorum Progress</span>
            <span className="text-xs text-gray-500">
              {bill.votes.quorumMet ? (
                <span className="text-green-600">&#10003; Quorum Met</span>
              ) : (
                `${totalVotes} / ${quorumTarget} votes`
              )}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                bill.votes.quorumMet ? 'bg-green-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${quorumProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vote Options */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => setSelectedChoice('for')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            selectedChoice === 'for'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <span className="text-2xl block mb-1">&#128077;</span>
          <span className="font-medium text-gray-900">For</span>
        </button>
        <button
          onClick={() => setSelectedChoice('against')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            selectedChoice === 'against'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-red-300'
          }`}
        >
          <span className="text-2xl block mb-1">&#128078;</span>
          <span className="font-medium text-gray-900">Against</span>
        </button>
        <button
          onClick={() => setSelectedChoice('abstain')}
          className={`p-4 rounded-lg border-2 text-center transition-all ${
            selectedChoice === 'abstain'
              ? 'border-gray-500 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-2xl block mb-1">&#128528;</span>
          <span className="font-medium text-gray-900">Abstain</span>
        </button>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-gray-700">Vote visibility:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPublic(true)}
            className={`px-3 py-1 rounded ${
              isPublic
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setIsPublic(false)}
            className={`px-3 py-1 rounded ${
              !isPublic
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Private
          </button>
        </div>
      </div>

      {/* Delegation Notice */}
      <div className="bg-indigo-100 rounded-lg p-3 mb-4 text-sm text-indigo-800">
        <strong>Liquid Democracy:</strong> You can also delegate your vote to a
        trusted representative who will vote on your behalf.{' '}
        <a href="#" className="underline">
          Manage delegations
        </a>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleVote}
        disabled={!selectedChoice || isSubmitting}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Your vote will be cryptographically verified and recorded on the
        governance ledger.
      </p>
    </div>
  );
}
