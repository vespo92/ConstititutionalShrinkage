import { VotingHistory } from '@/components/VotingHistory';
import { CheckCircle, XCircle, MinusCircle, TrendingUp, Calendar } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Voting History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your complete voting record with full transparency
        </p>
      </div>

      {/* Voting Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Votes For"
          value="98"
          color="civic"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Votes Against"
          value="42"
          color="alert"
        />
        <StatCard
          icon={<MinusCircle className="h-5 w-5" />}
          label="Abstentions"
          value="16"
          color="neutral"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Participation Rate"
          value="94%"
          color="vote"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Active Since"
          value="2024"
          color="delegate"
        />
      </div>

      {/* Transparency Notice */}
      <div className="card p-4 mb-6 bg-gradient-to-r from-governance-civic/5 to-governance-vote/5 border-governance-civic/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-governance-civic/10 rounded-lg text-governance-civic">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Full Transparency
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All your votes are recorded on-chain with cryptographic proofs. Anyone can verify
              your voting record, but only you can see votes made by your delegates on your behalf.
            </p>
          </div>
        </div>
      </div>

      <VotingHistory />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'civic' | 'alert' | 'vote' | 'delegate' | 'neutral';
}) {
  const colorClasses = {
    civic: 'text-governance-civic bg-governance-civic/10',
    alert: 'text-governance-alert bg-governance-alert/10',
    vote: 'text-governance-vote bg-governance-vote/10',
    delegate: 'text-governance-delegate bg-governance-delegate/10',
    neutral: 'text-gray-500 bg-gray-100 dark:bg-slate-700',
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
