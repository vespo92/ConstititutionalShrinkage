'use client';

import { Calendar, Clock, Users, MapPin, PlayCircle } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { TownHall } from '@/lib/types';

interface EventCardProps {
  event: TownHall;
}

export function EventCard({ event }: EventCardProps) {
  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';
  const eventDate = new Date(event.scheduledFor);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <span className="live-indicator px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
            LIVE
          </span>
        ) : isEnded ? (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Ended
          </span>
        ) : (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
            Upcoming
          </span>
        )}
        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4" />
          {event.attendees}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {event.title}
      </h3>

      {/* Host */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-community-100 dark:bg-community-900/30 rounded-full flex items-center justify-center text-community-600 dark:text-community-400 font-bold text-sm">
          {event.host.name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {event.host.name}
          </div>
          <div className="text-xs text-gray-500">{event.host.title}</div>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {format(eventDate, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {format(eventDate, 'h:mm a')} ({event.duration} min)
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {event.region}
        </div>
      </div>

      {/* Action Button */}
      <a
        href={isLive ? `/townhalls/live/${event.id}` : `/townhalls/${event.id}`}
        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors ${
          isLive
            ? 'bg-red-600 text-white hover:bg-red-700'
            : isEnded
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-community-600 text-white hover:bg-community-700'
        }`}
      >
        {isLive ? (
          <>
            <PlayCircle className="w-4 h-4" />
            Join Now
          </>
        ) : isEnded ? (
          'View Recording'
        ) : (
          'View Details'
        )}
      </a>
    </div>
  );
}
