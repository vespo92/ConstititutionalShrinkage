'use client';

import { useState, useCallback } from 'react';
import { Thread, Comment } from '@/lib/types';

interface UseDiscussionReturn {
  threads: Thread[];
  thread: Thread | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  fetchThreads: (params?: { sort?: string; timeframe?: string; category?: string }) => Promise<void>;
  fetchThread: (id: string) => Promise<void>;
  createThread: (data: { title: string; content: string; category: string; billId?: string; tags: string[] }) => Promise<Thread>;
  addComment: (data: { threadId: string; content: string; parentId?: string }) => Promise<Comment>;
  vote: (id: string, type: 'up' | 'down') => Promise<void>;
}

export function useDiscussion(): UseDiscussionReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async (params?: { sort?: string; timeframe?: string; category?: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Simulated data - replace with actual API call
      setThreads([
        {
          id: '1',
          title: 'What should we prioritize in the new energy bill?',
          content: 'Looking for community input on the upcoming energy legislation...',
          author: { id: '1', displayName: 'Alice Johnson' },
          category: 'legislation',
          tags: ['energy', 'climate'],
          upvotes: 45,
          downvotes: 3,
          commentCount: 23,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          pinned: true,
          locked: false,
        },
        {
          id: '2',
          title: 'Discussion on education funding reform',
          content: 'Thoughts on increasing teacher salaries and classroom resources...',
          author: { id: '2', displayName: 'Bob Smith' },
          category: 'policy',
          tags: ['education', 'funding'],
          upvotes: 32,
          downvotes: 5,
          commentCount: 15,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          pinned: false,
          locked: false,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThread = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulated data
      setThread({
        id,
        title: 'What should we prioritize in the new energy bill?',
        content: 'Looking for community input on the upcoming energy legislation. What aspects should we focus on? Renewable energy standards? Carbon pricing? Infrastructure investments?',
        author: { id: '1', displayName: 'Alice Johnson' },
        category: 'legislation',
        tags: ['energy', 'climate'],
        upvotes: 45,
        downvotes: 3,
        commentCount: 23,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        pinned: true,
        locked: false,
      });
      setComments([
        {
          id: '1',
          content: 'I think renewable energy standards should be the top priority.',
          author: { id: '2', displayName: 'Bob Smith' },
          threadId: id,
          upvotes: 12,
          downvotes: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          edited: false,
          replies: [
            {
              id: '2',
              content: 'Agreed, but we also need to consider job transition programs.',
              author: { id: '3', displayName: 'Carol White' },
              threadId: id,
              parentId: '1',
              upvotes: 8,
              downvotes: 0,
              createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              edited: false,
            },
          ],
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch thread');
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (data: { title: string; content: string; category: string; billId?: string; tags: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      const newThread: Thread = {
        id: Date.now().toString(),
        ...data,
        author: { id: 'current', displayName: 'Current User' },
        category: data.category as any,
        upvotes: 1,
        downvotes: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        locked: false,
      };
      return newThread;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (data: { threadId: string; content: string; parentId?: string }) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content: data.content,
      author: { id: 'current', displayName: 'Current User' },
      threadId: data.threadId,
      parentId: data.parentId,
      upvotes: 1,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      edited: false,
    };
    setComments((prev) => [...prev, newComment]);
    return newComment;
  }, []);

  const vote = useCallback(async (id: string, type: 'up' | 'down') => {
    // API call would go here
    console.log('Voting', id, type);
  }, []);

  return {
    threads,
    thread,
    comments,
    loading,
    error,
    fetchThreads,
    fetchThread,
    createThread,
    addComment,
    vote,
  };
}
