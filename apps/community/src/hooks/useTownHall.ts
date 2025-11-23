'use client';

import { useState, useCallback } from 'react';
import { TownHall } from '@/lib/types';

interface UseTownHallReturn {
  events: TownHall[];
  liveEvents: TownHall[];
  event: TownHall | null;
  loading: boolean;
  error: string | null;
  fetchEvents: (status?: string) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  rsvp: (id: string) => Promise<void>;
  submitQuestion: (eventId: string, question: string) => Promise<void>;
  raiseHand: (eventId: string) => Promise<void>;
}

export function useTownHall(): UseTownHallReturn {
  const [events, setEvents] = useState<TownHall[]>([]);
  const [liveEvents, setLiveEvents] = useState<TownHall[]>([]);
  const [event, setEvent] = useState<TownHall | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const allEvents: TownHall[] = [
        {
          id: '1',
          title: 'Q&A on Clean Energy Transition Act',
          description: 'Join Senator Johnson for a live Q&A session about the proposed Clean Energy Transition Act.',
          host: { id: 'h1', name: 'Sen. Johnson', title: 'State Senator, District 5' },
          scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          duration: 60,
          status: 'scheduled',
          attendees: 234,
          billIds: ['HR-2025-0042'],
          region: 'State',
        },
        {
          id: '2',
          title: 'Education Budget Town Hall',
          description: 'Discuss the upcoming education budget with Superintendent Williams.',
          host: { id: 'h2', name: 'Dr. Williams', title: 'School Superintendent' },
          scheduledFor: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          duration: 90,
          status: 'live',
          attendees: 567,
          region: 'Local',
        },
      ];

      const live = allEvents.filter((e) => e.status === 'live');
      setLiveEvents(live);

      if (status === 'live') {
        setEvents(live);
      } else if (status === 'upcoming') {
        setEvents(allEvents.filter((e) => e.status === 'scheduled'));
      } else if (status === 'archive') {
        setEvents(allEvents.filter((e) => e.status === 'ended'));
      } else {
        setEvents(allEvents);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setEvent({
        id,
        title: 'Q&A on Clean Energy Transition Act',
        description: 'Join Senator Johnson for a live Q&A session about the proposed Clean Energy Transition Act. We will discuss the key provisions, timeline for implementation, and address community concerns.',
        host: { id: 'h1', name: 'Sen. Johnson', title: 'State Senator, District 5' },
        scheduledFor: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration: 60,
        status: 'live',
        attendees: 567,
        billIds: ['HR-2025-0042'],
        region: 'State',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  }, []);

  const rsvp = useCallback(async (id: string) => {
    // API call would go here
    console.log('RSVP for event', id);
  }, []);

  const submitQuestion = useCallback(async (eventId: string, question: string) => {
    // API call would go here
    console.log('Submit question for event', eventId, question);
  }, []);

  const raiseHand = useCallback(async (eventId: string) => {
    // API call would go here
    console.log('Raise hand for event', eventId);
  }, []);

  return {
    events,
    liveEvents,
    event,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    rsvp,
    submitQuestion,
    raiseHand,
  };
}
