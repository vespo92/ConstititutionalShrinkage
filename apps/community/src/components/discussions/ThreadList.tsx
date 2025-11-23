'use client';

import { MessageSquare, ThumbsUp, Clock, Tag, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Thread } from '@/lib/types';

interface ThreadListProps {
  threads: Thread[];
  loading?: boolean;
}

export function ThreadList({ threads, loading }: ThreadListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No discussions found</p>
        <a href="/discussions/new" className="text-community-600 hover:underline mt-2 inline-block">
          Start a new discussion
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  const score = thread.upvotes - thread.downvotes;

  return (
    <a
      href={`/discussions/${thread.id}`}
      className="block bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* Vote Score */}
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 min-w-[40px]">
          <ThumbsUp className={`w-5 h-5 ${score > 0 ? 'text-green-500' : ''}`} />
          <span className="font-medium text-lg">{score}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {thread.pinned && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                Pinned
              </span>
            )}
            {thread.locked && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                Locked
              </span>
            )}
            {thread.billId && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {thread.billId}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {thread.title}
          </h3>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {thread.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {thread.commentCount} comments
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
            </span>
            <span>
              by <span className="text-gray-700 dark:text-gray-300">{thread.author.displayName}</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
