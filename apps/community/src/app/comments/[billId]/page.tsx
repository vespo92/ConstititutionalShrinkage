'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, ThumbsDown, Minus, Upload, Send } from 'lucide-react';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentList } from '@/components/comments/CommentList';

interface BillCommentData {
  billId: string;
  billTitle: string;
  deadline: string;
  status: 'open' | 'closed';
  summary: {
    total: number;
    support: number;
    oppose: number;
    neutral: number;
  };
}

export default function BillCommentsPage() {
  const params = useParams();
  const billId = params.billId as string;
  const [billData, setBillData] = useState<BillCommentData | null>(null);
  const [positionFilter, setPositionFilter] = useState<'all' | 'support' | 'oppose' | 'neutral'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bill data
    setLoading(true);
    // Simulated data
    setBillData({
      billId,
      billTitle: 'Clean Energy Transition Act',
      deadline: '2025-02-15',
      status: 'open',
      summary: {
        total: 1247,
        support: 687,
        oppose: 412,
        neutral: 148,
      },
    });
    setLoading(false);
  }, [billId]);

  if (loading || !billData) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const isOpen = billData.status === 'open';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/comments"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to comment periods
      </a>

      {/* Bill Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
            {billData.billId}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              isOpen
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}
          >
            {billData.status}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {billData.billTitle}
        </h1>

        {/* Comment Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {billData.summary.total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {billData.summary.support.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Support</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {billData.summary.oppose.toLocaleString()}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Oppose</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {billData.summary.neutral.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Neutral</div>
          </div>
        </div>
      </div>

      {/* Submit Comment Form */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Submit Your Comment
          </h2>
          <CommentForm billId={billId} />
        </div>
      )}

      {/* Filter and Comments */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Public Comments
          </h2>
          <div className="flex gap-2">
            {(['all', 'support', 'oppose', 'neutral'] as const).map((position) => (
              <button
                key={position}
                onClick={() => setPositionFilter(position)}
                className={`px-3 py-1.5 rounded text-sm capitalize flex items-center gap-1 transition-colors ${
                  positionFilter === position
                    ? 'bg-community-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {position === 'support' && <ThumbsUp className="w-3 h-3" />}
                {position === 'oppose' && <ThumbsDown className="w-3 h-3" />}
                {position === 'neutral' && <Minus className="w-3 h-3" />}
                {position}
              </button>
            ))}
          </div>
        </div>
        <CommentList billId={billId} positionFilter={positionFilter} />
      </div>
    </div>
  );
}
