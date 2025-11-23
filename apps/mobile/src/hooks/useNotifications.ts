import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import notificationsService from '@/services/notifications';

/**
 * useNotifications Hook
 * Provides notification state and handlers
 */
export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const initialize = useCallback(async () => {
    const success = await notificationsService.initialize();
    setIsEnabled(success);
    setIsInitialized(true);

    if (success) {
      const count = await notificationsService.getBadgeCount();
      setBadgeCount(count);
    }
  }, []);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as Record<string, unknown>;

      switch (data.type) {
        case 'vote_reminder':
          if (data.sessionId) {
            router.push(`/vote/${data.sessionId}`);
          }
          break;
        case 'bill_update':
          if (data.billId) {
            router.push(`/bill/${data.billId}`);
          }
          break;
        case 'delegation_activity':
          router.push('/(tabs)/delegations');
          break;
        default:
          // Navigate to dashboard
          router.push('/(tabs)');
      }
    },
    []
  );

  const updateBadgeCount = useCallback(async (count: number) => {
    await notificationsService.setBadgeCount(count);
    setBadgeCount(count);
  }, []);

  const clearBadge = useCallback(async () => {
    await notificationsService.clearBadge();
    setBadgeCount(0);
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    await notificationsService.setEnabled(enabled);
    setIsEnabled(enabled);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set up notification listeners
  useEffect(() => {
    const responseSubscription = notificationsService.addResponseListener(
      handleNotificationResponse
    );

    const receivedSubscription = notificationsService.addReceivedListener(() => {
      // Update badge count when notification received
      notificationsService.getBadgeCount().then(setBadgeCount);
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [handleNotificationResponse]);

  return {
    isEnabled,
    isInitialized,
    badgeCount,
    initialize,
    updateBadgeCount,
    clearBadge,
    setEnabled,
  };
}

export default useNotifications;
