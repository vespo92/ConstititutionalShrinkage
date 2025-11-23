'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  author: { name: string };
  timestamp: string;
}

interface ChatSidebarProps {
  eventId: string;
}

export function ChatSidebar({ eventId }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated messages
    setMessages([
      { id: '1', content: 'Great question about rural communities!', author: { name: 'Alice' }, timestamp: new Date(Date.now() - 1000 * 60).toISOString() },
      { id: '2', content: 'Looking forward to hearing more', author: { name: 'Bob' }, timestamp: new Date(Date.now() - 1000 * 45).toISOString() },
      { id: '3', content: 'This is really informative', author: { name: 'Carol' }, timestamp: new Date(Date.now() - 1000 * 30).toISOString() },
      { id: '4', content: 'Thanks for addressing our concerns', author: { name: 'David' }, timestamp: new Date(Date.now() - 1000 * 15).toISOString() },
    ]);
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      author: { name: 'You' },
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <span className="font-medium text-community-400">{message.author.name}: </span>
            <span className="text-white">{message.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-3 py-2 bg-slate-700 border-none rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-community-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-community-600 text-white rounded-lg hover:bg-community-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
