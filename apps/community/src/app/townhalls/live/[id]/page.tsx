'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, MessageSquare, Hand, Settings, Volume2, VolumeX } from 'lucide-react';
import { LiveRoom } from '@/components/townhalls/LiveRoom';
import { QAPanel } from '@/components/townhalls/QAPanel';
import { ChatSidebar } from '@/components/townhalls/ChatSidebar';
import { HandRaise } from '@/components/townhalls/HandRaise';
import { useTownHall } from '@/hooks/useTownHall';

export default function LiveTownHallPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { event, loading, fetchEvent, submitQuestion, raiseHand } = useTownHall();
  const [activePanel, setActivePanel] = useState<'qa' | 'chat'>('qa');
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    fetchEvent(eventId);
  }, [eventId]);

  const handleRaiseHand = useCallback(async () => {
    if (!handRaised) {
      await raiseHand(eventId);
    }
    setHandRaised(!handRaised);
  }, [eventId, handRaised, raiseHand]);

  if (loading || !event) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse text-white">Loading live event...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <a
            href="/townhalls"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <span className="live-indicator text-xs font-bold text-red-500">LIVE</span>
              <h1 className="text-white font-semibold">{event.title}</h1>
            </div>
            <p className="text-sm text-gray-400">
              Hosted by {event.host.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{event.attendees} watching</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button className="p-2 text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <LiveRoom event={event} isMuted={isMuted} />

          {/* Controls */}
          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center justify-center gap-4">
              <HandRaise
                isRaised={handRaised}
                onToggle={handleRaiseHand}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 flex flex-col bg-slate-800 border-l border-slate-700">
          {/* Panel Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActivePanel('qa')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activePanel === 'qa'
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Hand className="w-4 h-4" />
              Q&A
            </button>
            <button
              onClick={() => setActivePanel('chat')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activePanel === 'chat'
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'qa' ? (
              <QAPanel eventId={eventId} />
            ) : (
              <ChatSidebar eventId={eventId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
