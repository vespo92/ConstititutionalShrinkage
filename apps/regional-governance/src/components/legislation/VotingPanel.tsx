'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { LocalLegislation } from '@/types';
import { calculateVotePercentage, isVotingOpen, getVotingTimeRemaining } from '@/lib/utils';

interface VotingPanelProps {
  legislation: LocalLegislation;
  onVote: (vote: 'for' | 'against' | 'abstain') => Promise<void>;
  hasVoted?: boolean;
  userVote?: 'for' | 'against' | 'abstain';
}

export default function VotingPanel({ legislation, onVote, hasVoted = false, userVote }: VotingPanelProps) {
  const [selectedVote, setSelectedVote] = useState<'for' | 'against' | 'abstain' | null>(userVote || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const votePercentages = calculateVotePercentage(legislation.votes);
  const totalVotes = legislation.votes.for + legislation.votes.against + legislation.votes.abstain;
  const votingOpen = legislation.votingEnds && isVotingOpen(legislation.votingEnds);

  const handleVote = async () => {
    if (!selectedVote) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onVote(selectedVote);
    } catch (err) {
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Cast Your Vote</h3>

      {/* Voting Status */}
      {legislation.votingEnds && (
        <div className={`flex items-center mb-4 p-3 rounded-lg ${votingOpen ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <AlertCircle size={18} className={votingOpen ? 'text-blue-600' : 'text-gray-400'} />
          <span className={`ml-2 text-sm ${votingOpen ? 'text-blue-700' : 'text-gray-500'}`}>
            {getVotingTimeRemaining(legislation.votingEnds)}
          </span>
        </div>
      )}

      {/* Vote Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Current Results</span>
          <span className="text-sm font-medium text-gray-700">{totalVotes.toLocaleString()} votes</span>
        </div>

        <div className="space-y-2">
          <VoteBar label="For" percentage={votePercentages.forPercent} color="bg-green-500" count={legislation.votes.for} />
          <VoteBar label="Against" percentage={votePercentages.againstPercent} color="bg-red-500" count={legislation.votes.against} />
          <VoteBar label="Abstain" percentage={votePercentages.abstainPercent} color="bg-gray-400" count={legislation.votes.abstain} />
        </div>
      </div>

      {/* Vote Options */}
      {votingOpen && !hasVoted && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <VoteButton
              icon={ThumbsUp}
              label="For"
              selected={selectedVote === 'for'}
              onClick={() => setSelectedVote('for')}
              color="green"
            />
            <VoteButton
              icon={ThumbsDown}
              label="Against"
              selected={selectedVote === 'against'}
              onClick={() => setSelectedVote('against')}
              color="red"
            />
            <VoteButton
              icon={Minus}
              label="Abstain"
              selected={selectedVote === 'abstain'}
              onClick={() => setSelectedVote('abstain')}
              color="gray"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <Button
            onClick={handleVote}
            disabled={!selectedVote}
            isLoading={isSubmitting}
            className="w-full"
          >
            Submit Vote
          </Button>
        </>
      )}

      {hasVoted && (
        <div className="text-center py-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-medium">You voted: {userVote}</p>
          <p className="text-sm text-green-600 mt-1">Thank you for participating!</p>
        </div>
      )}

      {!votingOpen && !hasVoted && (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Voting is closed</p>
        </div>
      )}
    </div>
  );
}

interface VoteBarProps {
  label: string;
  percentage: number;
  color: string;
  count: number;
}

function VoteBar({ label, percentage, color, count }: VoteBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">{count.toLocaleString()} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

interface VoteButtonProps {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  selected: boolean;
  onClick: () => void;
  color: 'green' | 'red' | 'gray';
}

function VoteButton({ icon: Icon, label, selected, onClick, color }: VoteButtonProps) {
  const colorClasses = {
    green: selected ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-green-50 hover:border-green-300',
    red: selected ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-red-50 hover:border-red-300',
    gray: selected ? 'bg-gray-100 border-gray-500 text-gray-700' : 'hover:bg-gray-50 hover:border-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${colorClasses[color]} ${
        selected ? 'border-2' : 'border-gray-200'
      }`}
    >
      <Icon size={24} className={selected ? '' : 'text-gray-400'} />
      <span className="text-sm font-medium mt-2">{label}</span>
    </button>
  );
}
