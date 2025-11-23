'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Building2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PublicComment {
  id: string;
  author: { name: string };
  organization?: string;
  position: 'support' | 'oppose' | 'neutral';
  comment: string;
  createdAt: string;
}

interface CommentListProps {
  billId: string;
  positionFilter: 'all' | 'support' | 'oppose' | 'neutral';
}

export function CommentList({ billId, positionFilter }: CommentListProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulated data
    setComments([
      {
        id: '1',
        author: { name: 'Environmental Coalition' },
        organization: 'Green Future Alliance',
        position: 'support',
        comment: 'We strongly support this legislation as it aligns with our climate goals and sets meaningful targets for renewable energy adoption. The timeline is ambitious but achievable with proper investment.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '2',
        author: { name: 'John Doe' },
        position: 'oppose',
        comment: 'While I understand the intent, the implementation costs will be burdensome for small businesses. I recommend including exemptions or subsidies for companies with fewer than 50 employees.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: '3',
        author: { name: 'Energy Workers Union' },
        organization: 'National Energy Workers Association',
        position: 'neutral',
        comment: 'We have mixed feelings. While we support clean energy, we need guarantees for worker retraining programs and job placement assistance for affected workers.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ]);
    setLoading(false);
  }, [billId]);

  const filteredComments = comments.filter(
    (c) => positionFilter === 'all' || c.position === positionFilter
  );

  const positionConfig = {
    support: { icon: ThumbsUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    oppose: { icon: ThumbsDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    neutral: { icon: Minus, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredComments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No comments found for this filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredComments.map((comment) => {
        const config = positionConfig[comment.position];
        const Icon = config.icon;

        return (
          <div
            key={comment.id}
            className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-start gap-3">
              {/* Position Icon */}
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  {comment.organization && (
                    <>
                      <span className="text-gray-400">·</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Building2 className="w-3 h-3" />
                        {comment.organization}
                      </span>
                    </>
                  )}
                  <span className="text-gray-400">·</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.comment}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
