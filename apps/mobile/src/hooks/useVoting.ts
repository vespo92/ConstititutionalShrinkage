import { useState, useEffect, useCallback } from 'react';
import { votingApi, VotingSession } from '@/services/api';
import { offlineVoteQueue } from '@/services/storage';
import notificationsService from '@/services/notifications';

/**
 * useVoting Hook
 * Provides voting session data and vote casting functionality
 */
export function useVoting() {
  const [activeSessions, setActiveSessions] = useState<VotingSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<VotingSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<VotingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await votingApi.sessions();

    setIsLoading(false);

    if (response.success) {
      const sessions = response.data.sessions;

      setActiveSessions(sessions.filter((s) => s.status === 'active'));
      setCompletedSessions(sessions.filter((s) => s.status === 'completed'));
      setUpcomingSessions(sessions.filter((s) => s.status === 'upcoming'));

      // Schedule reminders for active sessions
      for (const session of sessions.filter((s) => s.status === 'active' && !s.hasVoted)) {
        await notificationsService.scheduleVoteReminder(
          session.id,
          session.title,
          new Date(session.deadline)
        );
      }
    } else {
      setError(response.error || 'Failed to fetch voting sessions');
    }
  }, []);

  const getSession = useCallback(
    (id: string): VotingSession | undefined => {
      return (
        activeSessions.find((s) => s.id === id) ||
        completedSessions.find((s) => s.id === id) ||
        upcomingSessions.find((s) => s.id === id)
      );
    },
    [activeSessions, completedSessions, upcomingSessions]
  );

  const fetchSession = useCallback(async (id: string): Promise<VotingSession | null> => {
    const response = await votingApi.getSession(id);

    if (response.success) {
      return response.data;
    }

    return null;
  }, []);

  const castVote = useCallback(
    async (
      sessionId: string,
      vote: 'yea' | 'nay' | 'abstain'
    ): Promise<{ hash: string } | null> => {
      const response = await votingApi.castVote(sessionId, vote);

      if (response.success) {
        // Update local state
        setActiveSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  hasVoted: true,
                  votes: {
                    ...s.votes,
                    [vote]: s.votes[vote] + 1,
                  },
                }
              : s
          )
        );

        // Cancel reminders for this session
        await notificationsService.cancelForSession(sessionId);

        return { hash: response.data.hash };
      }

      // If offline, queue the vote
      if (response.error?.includes('Network')) {
        await offlineVoteQueue.add({
          sessionId,
          vote,
          timestamp: new Date().toISOString(),
        });

        // Return a temporary hash
        return { hash: `pending-${Date.now()}` };
      }

      return null;
    },
    []
  );

  const verifyVote = useCallback(async (hash: string) => {
    const response = await votingApi.verifyVote(hash);
    return response.success ? response.data : null;
  }, []);

  const syncOfflineVotes = useCallback(async (): Promise<number> => {
    const queuedVotes = await offlineVoteQueue.getAll();
    let synced = 0;

    for (const vote of queuedVotes) {
      const response = await votingApi.castVote(vote.sessionId, vote.vote);

      if (response.success) {
        await offlineVoteQueue.remove(vote.sessionId);
        synced++;
      }
    }

    if (synced > 0) {
      await fetchSessions();
    }

    return synced;
  }, [fetchSessions]);

  const refresh = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    activeSessions,
    completedSessions,
    upcomingSessions,
    isLoading,
    error,
    fetchSessions,
    getSession,
    fetchSession,
    castVote,
    verifyVote,
    syncOfflineVotes,
    refresh,
  };
}

export default useVoting;
