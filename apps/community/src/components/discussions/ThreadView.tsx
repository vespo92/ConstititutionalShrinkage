'use client';

import { Clock, Tag, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Thread } from '@/lib/types';

interface ThreadViewProps {
  thread: Thread;
}

export function ThreadView({ thread }: ThreadViewProps) {
  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {thread.title}
      </h1>

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-community-100 dark:bg-community-900/30 rounded-full flex items-center justify-center text-community-600 dark:text-community-400">
          {thread.author.avatar ? (
            <img
              src={thread.author.avatar}
              alt={thread.author.displayName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {thread.author.displayName}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Category and Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-community-100 dark:bg-community-900/30 text-community-700 dark:text-community-400 rounded-full text-sm font-medium capitalize">
          {thread.category}
        </span>
        {thread.tags?.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {thread.content}
        </p>
      </div>
    </div>
  );
}
