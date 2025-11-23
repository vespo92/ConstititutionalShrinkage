'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Reply, Flag, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReplyEditor } from './ReplyEditor';
import { Comment } from '@/lib/types';

interface CommentTreeProps {
  comments: Comment[];
  onReply: (commentId: string) => void;
  onVote: (commentId: string, type: 'up' | 'down') => void;
  replyingTo: string | null;
  onSubmitReply: (content: string, parentId: string) => void;
  onCancelReply: () => void;
  depth?: number;
}

export function CommentTree({
  comments,
  onReply,
  onVote,
  replyingTo,
  onSubmitReply,
  onCancelReply,
  depth = 0,
}: CommentTreeProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className={depth > 0 ? 'comment-tree-nested' : ''}>
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onVote={onVote}
          replyingTo={replyingTo}
          onSubmitReply={onSubmitReply}
          onCancelReply={onCancelReply}
          depth={depth}
        />
      ))}
    </div>
  );
}

interface CommentNodeProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onVote: (commentId: string, type: 'up' | 'down') => void;
  replyingTo: string | null;
  onSubmitReply: (content: string, parentId: string) => void;
  onCancelReply: () => void;
  depth: number;
}

function CommentNode({
  comment,
  onReply,
  onVote,
  replyingTo,
  onSubmitReply,
  onCancelReply,
  depth,
}: CommentNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const score = comment.upvotes - comment.downvotes;
  const isReplying = replyingTo === comment.id;

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.author.displayName}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.edited && (
              <span className="text-gray-400 text-xs">(edited)</span>
            )}
          </div>

          {/* Content */}
          {!collapsed && (
            <>
              <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm">
                {/* Votes */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onVote(comment.id, 'up')}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      comment.userVote === 'up' ? 'text-green-500' : 'text-gray-400'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className={`font-medium ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {score}
                  </span>
                  <button
                    onClick={() => onVote(comment.id, 'down')}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      comment.userVote === 'down' ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>

                {depth < 5 && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-community-600"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                )}

                <button className="flex items-center gap-1 text-gray-400 hover:text-red-500">
                  <Flag className="w-4 h-4" />
                </button>

                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-community-600 hover:underline"
                  >
                    {collapsed ? `Show ${comment.replies.length} replies` : ''}
                  </button>
                )}
              </div>

              {/* Reply Editor */}
              {isReplying && (
                <div className="mt-4">
                  <ReplyEditor
                    placeholder={`Reply to ${comment.author.displayName}...`}
                    onSubmit={(content) => onSubmitReply(content, comment.id)}
                    onCancel={onCancelReply}
                    autoFocus
                  />
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                  <CommentTree
                    comments={comment.replies}
                    onReply={onReply}
                    onVote={onVote}
                    replyingTo={replyingTo}
                    onSubmitReply={onSubmitReply}
                    onCancelReply={onCancelReply}
                    depth={depth + 1}
                  />
                </div>
              )}
            </>
          )}

          {collapsed && comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setCollapsed(false)}
              className="text-sm text-community-600 hover:underline mt-1"
            >
              Show {comment.replies.length} replies
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
