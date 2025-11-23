'use client';

import { Calendar, MapPin, Users, Video, Clock } from 'lucide-react';
import type { CommunityEvent } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface EventCardProps {
  event: CommunityEvent;
  onRSVP?: () => void;
}

const typeIcons: Record<string, string> = {
  town_hall: '🏛️',
  community_meeting: '👥',
  workshop: '🎓',
  volunteer: '🤝',
  celebration: '🎉',
  emergency: '⚠️',
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function EventCard({ event, onRSVP }: EventCardProps) {
  const isUpcoming = event.status === 'upcoming';
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with type and status */}
      <div className="px-4 py-3 bg-gradient-to-r from-pod-green-50 to-pod-brown-50 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{typeIcons[event.type] || '📅'}</span>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {event.type.replace('_', ' ')}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-2 text-gray-400" />
            {formatDateTime(event.startTime)}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={14} className="mr-2 text-gray-400" />
            {new Date(event.endTime).getTime() - new Date(event.startTime).getTime() > 0
              ? `${Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60))} hours`
              : 'TBD'}
          </div>
          <div className="flex items-center text-gray-600">
            {event.isVirtual ? (
              <>
                <Video size={14} className="mr-2 text-gray-400" />
                Virtual Event
              </>
            ) : (
              <>
                <MapPin size={14} className="mr-2 text-gray-400" />
                {event.location}
              </>
            )}
          </div>
          <div className="flex items-center text-gray-600">
            <Users size={14} className="mr-2 text-gray-400" />
            {event.attendees} attending
            {spotsLeft !== null && spotsLeft > 0 && (
              <span className="ml-1 text-amber-600">({spotsLeft} spots left)</span>
            )}
          </div>
        </div>

        {/* Action */}
        {isUpcoming && onRSVP && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onRSVP}
              disabled={spotsLeft !== null && spotsLeft <= 0}
            >
              {spotsLeft !== null && spotsLeft <= 0 ? 'Event Full' : 'RSVP'}
            </Button>
          </div>
        )}

        {/* Virtual Link */}
        {event.isVirtual && event.virtualLink && event.status === 'ongoing' && (
          <div className="mt-4">
            <a
              href={event.virtualLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-pod-green-600 text-white py-2 rounded-lg hover:bg-pod-green-700 transition-colors"
            >
              Join Now
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        Organized by {event.organizer}
      </div>
    </div>
  );
}
