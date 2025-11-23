/**
 * Notification Service Types
 */

export enum NotificationType {
  // Voting
  VOTE_REMINDER = 'vote_reminder',
  VOTE_RESULT = 'vote_result',
  DELEGATION_RECEIVED = 'delegation_received',
  DELEGATION_USED = 'delegation_used',

  // Bills
  BILL_STATUS_CHANGE = 'bill_status_change',
  BILL_APPROACHING_VOTE = 'bill_approaching_vote',
  BILL_PASSED = 'bill_passed',
  BILL_FAILED = 'bill_failed',
  BILL_SUNSET_WARNING = 'bill_sunset_warning',

  // Constitutional
  COMPLIANCE_ISSUE = 'compliance_issue',
  AMENDMENT_PROPOSED = 'amendment_proposed',

  // System
  ACCOUNT_SECURITY = 'account_security',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export type DeliveryChannel = 'websocket' | 'email' | 'push';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: DeliveryChannel[];
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    voteReminder: boolean;
    voteResult: boolean;
    billStatusChange: boolean;
    billPassed: boolean;
    billFailed: boolean;
    billSunsetWarning: boolean;
    delegationReceived: boolean;
    delegationUsed: boolean;
    complianceIssue: boolean;
    amendmentProposed: boolean;
    accountSecurity: boolean;
    systemAnnouncement: boolean;
  };
  push: {
    enabled: boolean;
    voteReminder: boolean;
    voteResult: boolean;
    billStatusChange: boolean;
    delegationReceived: boolean;
    accountSecurity: boolean;
    systemAnnouncement: boolean;
  };
  websocket: {
    enabled: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
}

export interface WebSocketClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ack' | 'ping';
  channel?: string;        // e.g., 'bills', 'votes', 'region:123'
  notificationId?: string; // For acknowledgment
}

export interface WebSocketServerMessage {
  type: 'notification' | 'connected' | 'error' | 'subscribed' | 'unsubscribed' | 'pong';
  notification?: Notification;
  channel?: string;
  error?: string;
  connectionId?: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: DeliveryChannel[];
  expiresAt?: Date;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

export interface UserPushSubscription {
  userId: string;
  subscription: PushSubscription;
  createdAt: Date;
  lastUsedAt?: Date;
  userAgent?: string;
}
