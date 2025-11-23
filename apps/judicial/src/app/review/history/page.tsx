'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { useReview } from '@/hooks/useReview';
import { formatDate } from '@/lib/utils';
import { History, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import type { BillReview } from '@/types';

export default function ReviewHistoryPage() {
  const { reviews, fetchReviews, isLoading } = useReview();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const completedReviews = reviews.filter(r =>
    ['approved', 'rejected', 'requires_modification'].includes(r.status)
  );

  const columns = [
    {
      key: 'billId',
      header: 'Bill ID',
      render: (review: BillReview) => (
        <span className="font-mono text-sm">{review.billId}</span>
      ),
    },
    {
      key: 'billTitle',
      header: 'Title',
      render: (review: BillReview) => (
        <span className="font-medium">{review.billTitle}</span>
      ),
    },
    {
      key: 'status',
      header: 'Decision',
      render: (review: BillReview) => <StatusBadge status={review.status} />,
    },
    {
      key: 'reviewedAt',
      header: 'Reviewed',
      render: (review: BillReview) => (
        <span className="text-sm text-gray-500">
          {review.reviewedAt ? formatDate(review.reviewedAt) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (review: BillReview) => (
        <Link href={`/review/${review.billId}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/review">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <History className="h-7 w-7 text-judicial-primary" />
            Review History
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Past constitutional reviews and decisions
          </p>
        </div>
      </div>

      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <span>Completed Reviews</span>
          <Badge variant="default">{completedReviews.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
            </div>
          ) : (
            <DataTable
              data={completedReviews}
              columns={columns}
              keyExtractor={(review) => review.id}
              emptyMessage="No completed reviews"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
