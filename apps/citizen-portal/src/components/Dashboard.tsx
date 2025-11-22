'use client';

import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Users, Vote } from 'lucide-react';

// Mock data for active bills
const activeBills = [
  {
    id: 'bill-2025-127',
    title: 'Infrastructure Investment Act',
    summary: 'Modernizing transportation and digital infrastructure across all regions',
    category: 'Economics',
    status: 'voting',
    votingEnds: new Date('2025-11-25'),
    participation: 67,
    yourVote: null,
    forPercentage: 62,
    quorumMet: true,
  },
  {
    id: 'bill-2025-124',
    title: 'Education Reform Bill 2025',
    summary: 'Restructuring public education funding and curriculum standards',
    category: 'Education',
    status: 'voting',
    votingEnds: new Date('2025-11-28'),
    participation: 45,
    yourVote: 'for',
    forPercentage: 71,
    quorumMet: false,
  },
  {
    id: 'bill-2025-119',
    title: 'Healthcare Access Amendment',
    summary: 'Expanding healthcare coverage to underserved communities',
    category: 'Healthcare',
    status: 'voting',
    votingEnds: new Date('2025-11-30'),
    participation: 52,
    yourVote: 'against',
    forPercentage: 48,
    quorumMet: true,
  },
];

const recentVotes = [
  { bill: 'Climate Action Plan', vote: 'for', date: '2025-11-20', passed: true },
  { bill: 'Tax Reform Act', vote: 'against', date: '2025-11-18', passed: false },
  { bill: 'Privacy Protection Bill', vote: 'for', date: '2025-11-15', passed: true },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Vote className="h-5 w-5" />}
          label="Pending Votes"
          value="3"
          trend="+2 this week"
          color="vote"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Ending Soon"
          value="1"
          trend="24h left"
          color="alert"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Votes Cast"
          value="156"
          trend="All time"
          color="civic"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Delegators"
          value="23"
          trend="+3 this month"
          color="delegate"
        />
      </div>

      {/* Active Bills */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Active Bills Requiring Your Vote
          </h2>
          <Link
            href="/bills"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {activeBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </div>

      {/* Recent Voting Activity */}
      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Your Recent Votes
        </h2>
        <div className="space-y-3">
          {recentVotes.map((vote, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    vote.vote === 'for' ? 'bg-governance-civic' : 'bg-governance-alert'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {vote.bill}
                  </p>
                  <p className="text-xs text-gray-500">{vote.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`badge ${
                    vote.vote === 'for' ? 'badge-civic' : 'bg-governance-alert/10 text-governance-alert'
                  }`}
                >
                  {vote.vote === 'for' ? 'For' : 'Against'}
                </span>
                {vote.passed ? (
                  <CheckCircle className="h-4 w-4 text-governance-civic" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-governance-alert" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: 'vote' | 'civic' | 'delegate' | 'alert';
}) {
  const colorClasses = {
    vote: 'text-governance-vote bg-governance-vote/10',
    civic: 'text-governance-civic bg-governance-civic/10',
    delegate: 'text-governance-delegate bg-governance-delegate/10',
    alert: 'text-governance-alert bg-governance-alert/10',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">{trend}</p>
        </div>
      </div>
    </div>
  );
}

function BillCard({
  bill,
}: {
  bill: {
    id: string;
    title: string;
    summary: string;
    category: string;
    status: string;
    votingEnds: Date;
    participation: number;
    yourVote: string | null;
    forPercentage: number;
    quorumMet: boolean;
  };
}) {
  const daysLeft = Math.ceil(
    (bill.votingEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft <= 1;

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {bill.title}
            </h3>
            <span className="badge bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs">
              {bill.category}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
            {bill.summary}
          </p>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">
                {bill.forPercentage}% For / {100 - bill.forPercentage}% Against
              </span>
              <span className="text-gray-500">{bill.participation}% participation</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-governance-civic rounded-full"
                style={{ width: `${bill.forPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Time Remaining */}
          <div
            className={`flex items-center gap-1 text-xs ${
              isUrgent ? 'text-governance-alert' : 'text-gray-500'
            }`}
          >
            <Clock className="h-3 w-3" />
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </div>

          {/* Vote Status / Action */}
          {bill.yourVote ? (
            <span
              className={`badge ${
                bill.yourVote === 'for'
                  ? 'badge-civic'
                  : 'bg-governance-alert/10 text-governance-alert'
              }`}
            >
              Voted {bill.yourVote === 'for' ? 'For' : 'Against'}
            </span>
          ) : (
            <Link
              href={`/vote/${bill.id}`}
              className="btn-primary text-xs py-1 px-3"
            >
              Cast Vote
            </Link>
          )}

          {/* Quorum Status */}
          {!bill.quorumMet && (
            <span className="text-xs text-governance-alert flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Quorum not met
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
