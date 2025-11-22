'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NotificationUI } from '@/lib/types';
import { notificationsApi } from '@/lib/api';

interface UseNotificationsReturn {
  notifications: NotificationUI[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationsApi.getNotifications({ limit: 50 });
      // Map API response to UI type
      setNotifications(
        data.map((n) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<void> => {
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      try {
        await notificationsApi.markAsRead(notificationId);
      } catch (err) {
        // Revert on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
        );
        throw err;
      }
    },
    []
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      // Refresh to get correct state on error
      await loadNotifications();
      throw err;
    }
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}

/**
 * Hook for getting just the unread notification count
 * Useful for badges in navigation
 */
export function useUnreadNotificationCount(): {
  count: number;
  isLoading: boolean;
} {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const data = await notificationsApi.getUnreadCount();
        setCount(data.count);
      } catch {
        // Silent fail for badge count
      } finally {
        setIsLoading(false);
      }
    };

    loadCount();

    // Poll every minute
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return { count, isLoading };
}
