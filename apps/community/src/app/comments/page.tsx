'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Clock, MessageSquare } from 'lucide-react';
import { CommentList } from '@/components/comments/CommentList';
import { CommentFilter } from '@/components/comments/CommentFilter';

interface CommentPeriod {
  billId: string;
  billTitle: string;
  deadline: string;
  totalComments: number;
  status: 'open' | 'closed';
}

export default function PublicCommentsPage() {
  const [commentPeriods, setCommentPeriods] = useState<CommentPeriod[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch comment periods
    setLoading(true);
    // Simulated data
    setCommentPeriods([
      {
        billId: 'HR-2025-0042',
        billTitle: 'Clean Energy Transition Act',
        deadline: '2025-02-15',
        totalComments: 1247,
        status: 'open',
      },
      {
        billId: 'HR-2025-0038',
        billTitle: 'Education Funding Reform',
        deadline: '2025-02-01',
        totalComments: 892,
        status: 'open',
      },
      {
        billId: 'HR-2025-0035',
        billTitle: 'Infrastructure Investment Act',
        deadline: '2025-01-15',
        totalComments: 2341,
        status: 'closed',
      },
    ]);
    setLoading(false);
  }, [statusFilter]);

  const filteredPeriods = commentPeriods.filter(
    (p) => statusFilter === 'all' || p.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public Comments</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Submit formal comments on proposed legislation during open comment periods
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {(['all', 'open', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              statusFilter === status
                ? 'bg-community-600 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Comment Periods List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filteredPeriods.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No {statusFilter === 'all' ? '' : statusFilter} comment periods found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPeriods.map((period) => (
            <CommentPeriodCard key={period.billId} period={period} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentPeriodCard({ period }: { period: CommentPeriod }) {
  const isOpen = period.status === 'open';
  const deadline = new Date(period.deadline);
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              {period.billId}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isOpen
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
              }`}
            >
              {period.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {period.billTitle}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {period.totalComments.toLocaleString()} comments
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {isOpen
                ? daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : 'Deadline today'
                : `Closed ${period.deadline}`}
            </div>
          </div>
        </div>
        <a
          href={`/comments/${period.billId}`}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isOpen
              ? 'bg-community-600 text-white hover:bg-community-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isOpen ? 'Submit Comment' : 'View Comments'}
        </a>
      </div>
    </div>
  );
}
