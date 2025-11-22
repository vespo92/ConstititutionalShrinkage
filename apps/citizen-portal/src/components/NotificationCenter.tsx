'use client';

import { Bell, Vote, Users, FileText, AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'vote' | 'delegation' | 'bill' | 'alert' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Vote Closing Soon',
    message: 'Infrastructure Investment Act voting ends in 24 hours. You have not voted yet.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    actionUrl: '/vote/bill-2025-127',
    actionLabel: 'Vote Now',
  },
  {
    id: '2',
    type: 'delegation',
    title: 'New Delegation Request',
    message: 'Alex Turner wants to delegate their healthcare votes to you.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: '/delegations/manage',
    actionLabel: 'Review',
  },
  {
    id: '3',
    type: 'success',
    title: 'Bill Passed',
    message: 'Climate Action Plan (which you voted FOR) has passed with 68% approval.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: '4',
    type: 'bill',
    title: 'New Bill in Your Region',
    message: 'Education Reform Bill 2025 has been introduced in your jurisdiction.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    actionUrl: '/bills/bill-2025-124',
    actionLabel: 'View Bill',
  },
  {
    id: '5',
    type: 'vote',
    title: 'Delegate Voted on Your Behalf',
    message: 'Sarah Chen voted FOR Tax Code Simplification on your behalf.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    read: true,
    actionUrl: '/history',
    actionLabel: 'View Details',
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-governance-alert text-white text-xs">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === 'unread'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => markAsRead(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: () => void;
}) {
  const iconMap = {
    vote: <Vote className="h-4 w-4" />,
    delegation: <Users className="h-4 w-4" />,
    bill: <FileText className="h-4 w-4" />,
    alert: <AlertTriangle className="h-4 w-4" />,
    success: <Check className="h-4 w-4" />,
  };

  const colorMap = {
    vote: 'text-governance-vote bg-governance-vote/10',
    delegation: 'text-governance-delegate bg-governance-delegate/10',
    bill: 'text-primary-600 bg-primary-100 dark:bg-primary-900/20',
    alert: 'text-governance-alert bg-governance-alert/10',
    success: 'text-governance-civic bg-governance-civic/10',
  };

  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div
      className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${
        !notification.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
      }`}
      onClick={onMarkAsRead}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${colorMap[notification.type]} shrink-0`}>
          {iconMap[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm ${
                !notification.read
                  ? 'font-semibold text-gray-900 dark:text-white'
                  : 'font-medium text-gray-700 dark:text-gray-300'
              }`}
            >
              {notification.title}
            </p>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          {notification.actionUrl && notification.actionLabel && (
            <a
              href={notification.actionUrl}
              className="inline-block mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.actionLabel} &rarr;
            </a>
          )}
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
