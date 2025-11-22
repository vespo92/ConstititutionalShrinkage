'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Users,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
  Lock,
  Unlock,
} from 'lucide-react';

interface VoteRecord {
  id: string;
  billId: string;
  billTitle: string;
  category: string;
  choice: 'for' | 'against' | 'abstain';
  timestamp: Date;
  delegatedBy?: string;
  delegateVoted?: boolean;
  delegateName?: string;
  billPassed: boolean | null;
  forPercentage: number;
  participation: number;
  cryptoProof: string;
  weight: number;
}

const mockVotes: VoteRecord[] = [
  {
    id: 'v1',
    billId: 'bill-2025-127',
    billTitle: 'Infrastructure Investment Act',
    category: 'Economics',
    choice: 'for',
    timestamp: new Date('2025-11-20T14:32:00'),
    billPassed: null,
    forPercentage: 62,
    participation: 67,
    cryptoProof: '0x7f3a9b2c...',
    weight: 1.0,
  },
  {
    id: 'v2',
    billId: 'bill-2025-122',
    billTitle: 'Climate Action Plan',
    category: 'Environment',
    choice: 'for',
    timestamp: new Date('2025-11-18T09:15:00'),
    billPassed: true,
    forPercentage: 68,
    participation: 72,
    cryptoProof: '0x8e4b1c3d...',
    weight: 1.0,
  },
  {
    id: 'v3',
    billId: 'bill-2025-120',
    billTitle: 'Tax Reform Act',
    category: 'Economics',
    choice: 'against',
    timestamp: new Date('2025-11-15T16:45:00'),
    billPassed: false,
    forPercentage: 41,
    participation: 78,
    cryptoProof: '0x2d5e7f8a...',
    weight: 1.0,
  },
  {
    id: 'v4',
    billId: 'bill-2025-118',
    billTitle: 'Healthcare Access Amendment',
    category: 'Healthcare',
    choice: 'for',
    timestamp: new Date('2025-11-12T11:20:00'),
    delegateVoted: true,
    delegateName: 'Dr. Sarah Chen',
    billPassed: true,
    forPercentage: 71,
    participation: 65,
    cryptoProof: '0x9f1c2b4e...',
    weight: 1.0,
  },
  {
    id: 'v5',
    billId: 'bill-2025-115',
    billTitle: 'Privacy Protection Bill',
    category: 'Technology',
    choice: 'for',
    timestamp: new Date('2025-11-10T08:30:00'),
    billPassed: true,
    forPercentage: 82,
    participation: 69,
    cryptoProof: '0x3a4b5c6d...',
    weight: 1.0,
  },
  {
    id: 'v6',
    billId: 'bill-2025-112',
    billTitle: 'Education Funding Reform',
    category: 'Education',
    choice: 'abstain',
    timestamp: new Date('2025-11-08T13:50:00'),
    billPassed: true,
    forPercentage: 55,
    participation: 58,
    cryptoProof: '0x6e7f8a9b...',
    weight: 1.0,
  },
];

export function VotingHistory() {
  const [filter, setFilter] = useState<'all' | 'for' | 'against' | 'abstain' | 'delegated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVotes = mockVotes.filter((vote) => {
    if (filter === 'delegated') return vote.delegateVoted;
    if (filter !== 'all' && vote.choice !== filter) return false;
    if (searchQuery && !vote.billTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <FilterChip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All Votes"
            />
            <FilterChip
              active={filter === 'for'}
              onClick={() => setFilter('for')}
              label="Voted For"
              color="civic"
            />
            <FilterChip
              active={filter === 'against'}
              onClick={() => setFilter('against')}
              label="Voted Against"
              color="alert"
            />
            <FilterChip
              active={filter === 'abstain'}
              onClick={() => setFilter('abstain')}
              label="Abstained"
              color="neutral"
            />
            <FilterChip
              active={filter === 'delegated'}
              onClick={() => setFilter('delegated')}
              label="Delegate Voted"
              color="delegate"
            />
          </div>
        )}
      </div>

      {/* Votes List */}
      <div className="card divide-y divide-gray-200 dark:divide-slate-700">
        {filteredVotes.map((vote) => (
          <VoteCard key={vote.id} vote={vote} />
        ))}
        {filteredVotes.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No votes found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: 'civic' | 'alert' | 'delegate' | 'neutral';
}) {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer';
  const activeClasses = {
    civic: 'bg-governance-civic text-white',
    alert: 'bg-governance-alert text-white',
    delegate: 'bg-governance-delegate text-white',
    neutral: 'bg-gray-500 text-white',
    default: 'bg-primary-600 text-white',
  };
  const inactiveClasses = 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${
        active ? activeClasses[color || 'default'] : inactiveClasses
      }`}
    >
      {label}
    </button>
  );
}

function VoteCard({ vote }: { vote: VoteRecord }) {
  const choiceConfig = {
    for: { icon: CheckCircle, color: 'text-governance-civic', bg: 'bg-governance-civic/10', label: 'For' },
    against: { icon: XCircle, color: 'text-governance-alert', bg: 'bg-governance-alert/10', label: 'Against' },
    abstain: { icon: MinusCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-slate-700', label: 'Abstain' },
  };

  const config = choiceConfig[vote.choice];
  const Icon = config.icon;

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Vote Choice Icon */}
        <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {vote.billTitle}
            </h3>
            <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs">
              {vote.category}
            </span>
          </div>

          {/* Delegate indicator */}
          {vote.delegateVoted && (
            <div className="flex items-center gap-1 text-xs text-governance-delegate mb-2">
              <Users className="h-3 w-3" />
              Voted by delegate: {vote.delegateName}
            </div>
          )}

          {/* Vote Result Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">
                {vote.forPercentage}% For / {100 - vote.forPercentage}% Against
              </span>
              <span className="text-gray-500">{vote.participation}% participation</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-governance-civic rounded-full"
                style={{ width: `${vote.forPercentage}%` }}
              />
            </div>
          </div>

          {/* Timestamp and Crypto Proof */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{vote.timestamp.toLocaleDateString()} at {vote.timestamp.toLocaleTimeString()}</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Proof: {vote.cryptoProof}
            </span>
          </div>
        </div>

        {/* Right Side - Status & Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Your Vote */}
          <span className={`badge ${config.bg} ${config.color}`}>
            Voted {config.label}
          </span>

          {/* Bill Status */}
          {vote.billPassed !== null && (
            <span
              className={`badge ${
                vote.billPassed
                  ? 'bg-governance-civic/10 text-governance-civic'
                  : 'bg-governance-alert/10 text-governance-alert'
              }`}
            >
              {vote.billPassed ? 'Passed' : 'Failed'}
            </span>
          )}

          {/* View Details */}
          <a
            href={`/bills/${vote.billId}`}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View Bill <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
