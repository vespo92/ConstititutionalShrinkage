import { create } from 'zustand';
import { VotingSession } from '@/services/api';

interface VoteReceipt {
  sessionId: string;
  vote: 'yea' | 'nay' | 'abstain';
  hash: string;
  timestamp: string;
}

interface VotingState {
  sessions: VotingSession[];
  activeSession: VotingSession | null;
  receipts: VoteReceipt[];
  offlineVotes: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: VotingSession[]) => void;
  updateSession: (id: string, updates: Partial<VotingSession>) => void;
  setActiveSession: (session: VotingSession | null) => void;
  addReceipt: (receipt: VoteReceipt) => void;
  setOfflineVotes: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markVoted: (sessionId: string, vote: 'yea' | 'nay' | 'abstain') => void;
  reset: () => void;
}

const initialState = {
  sessions: [],
  activeSession: null,
  receipts: [],
  offlineVotes: 0,
  isLoading: false,
  error: null,
};

/**
 * Voting Store
 * Global state management for voting sessions
 */
export const useVotingStore = create<VotingState>((set, get) => ({
  ...initialState,

  setSessions: (sessions) => {
    set({ sessions, error: null });
  },

  updateSession: (id, updates) => {
    const { sessions, activeSession } = get();

    set({
      sessions: sessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      ),
      activeSession:
        activeSession?.id === id
          ? { ...activeSession, ...updates }
          : activeSession,
    });
  },

  setActiveSession: (session) => {
    set({ activeSession: session });
  },

  addReceipt: (receipt) => {
    const { receipts } = get();
    set({ receipts: [...receipts, receipt] });
  },

  setOfflineVotes: (count) => {
    set({ offlineVotes: count });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  markVoted: (sessionId, vote) => {
    const { sessions, activeSession } = get();

    const updateVotes = (session: VotingSession): VotingSession => ({
      ...session,
      hasVoted: true,
      votes: {
        ...session.votes,
        [vote]: session.votes[vote] + 1,
      },
    });

    set({
      sessions: sessions.map((session) =>
        session.id === sessionId ? updateVotes(session) : session
      ),
      activeSession:
        activeSession?.id === sessionId
          ? updateVotes(activeSession)
          : activeSession,
    });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectActiveSessions = (state: VotingState) =>
  state.sessions.filter((s) => s.status === 'active');

export const selectCompletedSessions = (state: VotingState) =>
  state.sessions.filter((s) => s.status === 'completed');

export const selectUpcomingSessions = (state: VotingState) =>
  state.sessions.filter((s) => s.status === 'upcoming');

export const selectPendingVotes = (state: VotingState) =>
  state.sessions.filter((s) => s.status === 'active' && !s.hasVoted);

export const selectSessionById = (state: VotingState, id: string) =>
  state.sessions.find((s) => s.id === id);

export const selectReceiptBySession = (state: VotingState, sessionId: string) =>
  state.receipts.find((r) => r.sessionId === sessionId);

export default useVotingStore;
