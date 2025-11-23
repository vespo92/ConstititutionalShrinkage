'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Bell, Share2, ExternalLink } from 'lucide-react';
import { QAPanel } from '@/components/townhalls/QAPanel';
import { useTownHall } from '@/hooks/useTownHall';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function TownHallDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { event, loading, fetchEvent, rsvp } = useTownHall();
  const [hasRSVP, setHasRSVP] = useState(false);

  useEffect(() => {
    fetchEvent(eventId);
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Event not found
        </h2>
        <a href="/townhalls" className="text-community-600 hover:underline mt-2 inline-block">
          Back to town halls
        </a>
      </div>
    );
  }

  const isLive = event.status === 'live';
  const isEnded = event.status === 'ended';
  const isUpcoming = event.status === 'scheduled';

  const handleRSVP = async () => {
    await rsvp(eventId);
    setHasRSVP(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/townhalls"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to town halls
      </a>

      {/* Live Banner */}
      {isLive && (
        <a
          href={`/townhalls/live/${event.id}`}
          className="block bg-red-600 rounded-lg p-6 text-white hover:bg-red-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="live-indicator font-bold text-lg">LIVE NOW</div>
              <span>{event.attendees} attending</span>
            </div>
            <span className="flex items-center gap-2">
              Join Now
              <ExternalLink className="w-5 h-5" />
            </span>
          </div>
        </a>
      )}

      {/* Event Details */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {event.title}
        </h1>

        {/* Host Info */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="w-12 h-12 bg-community-100 dark:bg-community-900/30 rounded-full flex items-center justify-center text-community-600 dark:text-community-400 font-bold">
            {event.host.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{event.host.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{event.host.title}</div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>{format(new Date(event.scheduledFor), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="w-5 h-5 text-gray-400" />
            <span>{format(new Date(event.scheduledFor), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 text-gray-400" />
            <span>{event.attendees} registered</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span>{event.region}</span>
          </div>
        </div>

        {/* Description */}
        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
        </div>

        {/* Related Bills */}
        {event.billIds && event.billIds.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Related Legislation</h3>
            <div className="flex flex-wrap gap-2">
              {event.billIds.map((billId) => (
                <a
                  key={billId}
                  href={`/legislative/bills/${billId}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <ExternalLink className="w-3 h-3" />
                  {billId}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          {isUpcoming && (
            <>
              <button
                onClick={handleRSVP}
                disabled={hasRSVP}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  hasRSVP
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-community-600 text-white hover:bg-community-700'
                }`}
              >
                <Bell className="w-4 h-4" />
                {hasRSVP ? 'Registered' : 'RSVP'}
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </>
          )}
          {isLive && (
            <a
              href={`/townhalls/live/${event.id}`}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Join Live Event
            </a>
          )}
        </div>
      </div>

      {/* Q&A Preview */}
      {isUpcoming && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Submit Questions in Advance
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Questions with the most upvotes will be prioritized during the event.
          </p>
          <QAPanel eventId={event.id} isPreview />
        </div>
      )}

      {/* Recording (if ended) */}
      {isEnded && event.recording && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recording
          </h2>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <video
              controls
              className="w-full h-full rounded-lg"
              src={event.recording.url}
            />
          </div>
          {event.transcript && (
            <details className="mt-4">
              <summary className="cursor-pointer text-community-600 hover:underline">
                View Transcript
              </summary>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm">
                {event.transcript}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
