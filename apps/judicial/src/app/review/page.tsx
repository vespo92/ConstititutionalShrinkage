'use client';

import { useEffect, useState } from 'react';
import { ReviewQueue } from '@/components/review/ReviewQueue';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useReview } from '@/hooks/useReview';
import { FileCheck, Filter } from 'lucide-react';

export default function ReviewPage() {
  const { reviews, fetchReviews, isLoading, pendingCount, urgentCount } = useReview();
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    fetchReviews(statusFilter || undefined);
  }, [fetchReviews, statusFilter]);

  const filters = [
    { value: '', label: 'All', count: reviews.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'in_review', label: 'In Review', count: reviews.filter(r => r.status === 'in_review').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileCheck className="h-7 w-7 text-judicial-primary" />
            Constitutional Review
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Review pending bills for constitutional compliance
          </p>
        </div>
        {urgentCount > 0 && (
          <Badge variant="violation" size="lg">
            {urgentCount} Urgent
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-slate-400">Filter:</span>
        </div>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
              <Badge variant="default" size="sm" className="ml-2">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
        </div>
      ) : (
        <ReviewQueue reviews={reviews} />
      )}
    </div>
  );
}
