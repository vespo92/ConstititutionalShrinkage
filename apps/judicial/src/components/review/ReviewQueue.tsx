'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { Clock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { BillReview } from '@/types';

interface ReviewQueueProps {
  reviews: BillReview[];
  onSelectReview?: (review: BillReview) => void;
}

export function ReviewQueue({ reviews, onSelectReview }: ReviewQueueProps) {
  const sortedReviews = [...reviews].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-judicial-primary" />
          <span>Pending Reviews</span>
          <Badge variant="info">{reviews.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {sortedReviews.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
              No pending reviews
            </div>
          ) : (
            sortedReviews.map((review) => (
              <div
                key={review.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => onSelectReview?.(review)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={review.priority} />
                      <StatusBadge status={review.status} />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {review.billTitle}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Bill ID: {review.billId}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(review.submittedAt)}
                      </span>
                      {review.regionId && (
                        <span>Region: {review.regionId}</span>
                      )}
                    </div>
                  </div>
                  <Link href={`/review/${review.billId}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
