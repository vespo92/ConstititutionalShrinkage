import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';
import { storage, STORAGE_KEYS } from './storage';

/**
 * Notifications Service
 * Handles push notification registration, permissions, and scheduling
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'vote_reminder' | 'bill_update' | 'delegation_activity' | 'vote_confirmed';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationsService {
  private expoPushToken: string | null = null;

  /**
   * Initialize notifications and request permissions
   */
  async initialize(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return false;
    }

    // Get the Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.expoPushToken = tokenData.data;

      // Register token with backend
      await this.registerToken(this.expoPushToken);

      // Set up Android channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      return true;
    } catch (error) {
      console.error('Error getting push token:', error);
      return false;
    }
  }

  /**
   * Set up Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('votes', {
      name: 'Voting Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });

    await Notifications.setNotificationChannelAsync('bills', {
      name: 'Bill Updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync('delegations', {
      name: 'Delegation Activity',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  /**
   * Register push token with backend
   */
  private async registerToken(token: string): Promise<void> {
    try {
      await api.post('/notifications/register', {
        token,
        platform: Platform.OS,
        deviceId: Device.deviceName,
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  /**
   * Get the current push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocal(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
      },
      trigger,
    });
  }

  /**
   * Schedule a voting reminder
   */
  async scheduleVoteReminder(
    sessionId: string,
    sessionTitle: string,
    deadline: Date
  ): Promise<void> {
    // Schedule reminder 1 hour before deadline
    const reminderTime = new Date(deadline.getTime() - 60 * 60 * 1000);

    if (reminderTime > new Date()) {
      await this.scheduleLocal(
        {
          type: 'vote_reminder',
          title: 'Voting Session Ending Soon',
          body: `"${sessionTitle}" ends in 1 hour. Don't forget to vote!`,
          data: { sessionId },
        },
        { date: reminderTime }
      );
    }

    // Schedule reminder 15 minutes before deadline
    const urgentReminderTime = new Date(deadline.getTime() - 15 * 60 * 1000);

    if (urgentReminderTime > new Date()) {
      await this.scheduleLocal(
        {
          type: 'vote_reminder',
          title: 'Last Chance to Vote!',
          body: `"${sessionTitle}" ends in 15 minutes!`,
          data: { sessionId },
        },
        { date: urgentReminderTime }
      );
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancel notifications for a specific session
   */
  async cancelForSession(sessionId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(
      (n) => (n.content.data as Record<string, unknown>)?.sessionId === sessionId
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Add notification received listener
   */
  addReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    const stored = await storage.get(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    if (stored === 'false') return false;

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Enable/disable notifications
   */
  async setEnabled(enabled: boolean): Promise<void> {
    await storage.set(STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
