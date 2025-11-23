'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, FileSignature, Video, ThumbsUp, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'discussion' | 'petition' | 'townhall' | 'comment' | 'signature';
  user: {
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    title: string;
  };
  timestamp: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data
    setActivities([
      {
        id: '1',
        type: 'discussion',
        user: { name: 'Alice Johnson' },
        target: { id: 'd1', title: 'What should we prioritize in the new energy bill?' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: '2',
        type: 'signature',
        user: { name: 'Bob Smith' },
        target: { id: 'p1', title: 'Expand public transit to underserved areas' },
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: '3',
        type: 'comment',
        user: { name: 'Carol White' },
        target: { id: 'd2', title: 'Discussion on education funding reform' },
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: '4',
        type: 'townhall',
        user: { name: 'David Brown' },
        target: { id: 't1', title: 'Q&A on Infrastructure Bill' },
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'discussion':
        return <MessageSquare className="w-4 h-4" />;
      case 'petition':
      case 'signature':
        return <FileSignature className="w-4 h-4" />;
      case 'townhall':
        return <Video className="w-4 h-4" />;
      case 'comment':
        return <ThumbsUp className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getAction = (type: Activity['type']) => {
    switch (type) {
      case 'discussion':
        return 'started a discussion';
      case 'petition':
        return 'created a petition';
      case 'signature':
        return 'signed a petition';
      case 'townhall':
        return 'registered for town hall';
      case 'comment':
        return 'commented on';
      default:
        return 'participated in';
    }
  };

  const getLink = (type: Activity['type'], id: string) => {
    switch (type) {
      case 'discussion':
      case 'comment':
        return `/discussions/${id}`;
      case 'petition':
      case 'signature':
        return `/petitions/${id}`;
      case 'townhall':
        return `/townhalls/${id}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm animate-pulse space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-community-100 dark:bg-community-900/30 rounded-full flex items-center justify-center text-community-600 dark:text-community-400">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">
                  {activity.user.name}
                </span>{' '}
                {getAction(activity.type)}{' '}
                <a
                  href={getLink(activity.type, activity.target.id)}
                  className="text-community-600 dark:text-community-400 hover:underline truncate inline-block max-w-[200px] align-bottom"
                >
                  {activity.target.title}
                </a>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
