'use client';

import { useState, useEffect } from 'react';
import { Video, Calendar, Users, Clock, PlayCircle, Archive } from 'lucide-react';
import { EventCard } from '@/components/townhalls/EventCard';
import { useTownHall } from '@/hooks/useTownHall';

type TabType = 'upcoming' | 'live' | 'archive';

export default function TownHallsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { events, liveEvents, loading, fetchEvents } = useTownHall();

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'live', label: 'Live Now', icon: PlayCircle, count: liveEvents.length },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Virtual Town Halls</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Participate in live Q&A sessions with elected officials
          </p>
        </div>
      </div>

      {/* Live Events Banner */}
      {liveEvents.length > 0 && (
        <div className="bg-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="live-indicator font-bold text-lg">
              {liveEvents.length} LIVE NOW
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map((event) => (
              <a
                key={event.id}
                href={`/townhalls/live/${event.id}`}
                className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors"
              >
                <h3 className="font-semibold mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-red-100">
                  <Users className="w-4 h-4" />
                  {event.attendees} attending
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-community-600 text-community-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'live' && tab.count > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'live'
              ? 'No live events right now'
              : activeTab === 'upcoming'
              ? 'No upcoming events scheduled'
              : 'No archived events yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
