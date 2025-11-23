'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Flag, Bookmark, ExternalLink } from 'lucide-react';
import { ThreadView } from '@/components/discussions/ThreadView';
import { CommentTree } from '@/components/discussions/CommentTree';
import { ReplyEditor } from '@/components/discussions/ReplyEditor';
import { VoteButtons } from '@/components/discussions/VoteButtons';
import { useDiscussion } from '@/hooks/useDiscussion';

export default function DiscussionThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const { thread, comments, loading, fetchThread, addComment, vote } = useDiscussion();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchThread(threadId);
  }, [threadId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Discussion not found
        </h2>
        <a href="/discussions" className="text-community-600 hover:underline mt-2 inline-block">
          Back to discussions
        </a>
      </div>
    );
  }

  const handleSubmitComment = async (content: string, parentId?: string) => {
    await addComment({
      threadId,
      content,
      parentId,
    });
    setReplyingTo(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/discussions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to discussions
      </a>

      {/* Thread Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex gap-4">
          {/* Vote Column */}
          <VoteButtons
            upvotes={thread.upvotes}
            downvotes={thread.downvotes}
            userVote={thread.userVote}
            onVote={(type) => vote(threadId, type)}
          />

          {/* Content */}
          <div className="flex-1">
            <ThreadView thread={thread} />

            {/* Bill Link (if applicable) */}
            {thread.billId && (
              <a
                href={`/legislative/bills/${thread.billId}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Related Bill
              </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Editor */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
        <ReplyEditor
          placeholder="Add a comment..."
          onSubmit={(content) => handleSubmitComment(content)}
        />
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Comments ({thread.commentCount})
        </h2>
        <CommentTree
          comments={comments}
          onReply={(commentId) => setReplyingTo(commentId)}
          onVote={(commentId, type) => vote(commentId, type)}
          replyingTo={replyingTo}
          onSubmitReply={handleSubmitComment}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
}
