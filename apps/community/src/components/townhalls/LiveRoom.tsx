'use client';

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { TownHall } from '@/lib/types';

interface LiveRoomProps {
  event: TownHall;
  isMuted: boolean;
}

export function LiveRoom({ event, isMuted }: LiveRoomProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="flex-1 relative bg-black">
      {/* Video Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-community-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
            {event.host.name.charAt(0)}
          </div>
          <h2 className="text-xl font-semibold">{event.host.name}</h2>
          <p className="text-gray-400">{event.host.title}</p>
          {isMuted && (
            <p className="text-yellow-400 mt-2 text-sm">Audio is muted</p>
          )}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-4 left-4">
        <span className="live-indicator px-3 py-1 bg-red-600 text-white rounded text-sm font-medium">
          LIVE
        </span>
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-black/50 text-white rounded text-sm">
          {event.attendees.toLocaleString()} watching
        </span>
      </div>
    </div>
  );
}
