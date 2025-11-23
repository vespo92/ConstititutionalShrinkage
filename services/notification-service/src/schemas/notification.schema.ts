/**
 * Notification Schemas
 *
 * Zod schemas for request/response validation.
 */

import { z } from 'zod';
import { NotificationType } from '../types/index.js';

// Notification type enum schema
const notificationTypeSchema = z.nativeEnum(NotificationType);

// Delivery channel schema
const deliveryChannelSchema = z.enum(['websocket', 'email', 'push']);

// Create notification schema
export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  data: z.record(z.unknown()).optional(),
  channels: z.array(deliveryChannelSchema).optional().default(['websocket']),
  expiresAt: z.string().datetime().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// Send notification schema (internal API)
export const sendNotificationSchema = z.object({
  type: notificationTypeSchema,
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  data: z.record(z.unknown()).optional(),
  channels: z.array(deliveryChannelSchema).default(['websocket']),
});

// List notifications query schema
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: notificationTypeSchema.optional(),
  read: z.coerce.boolean().optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

// Mark as read schema
export const markReadSchema = z.object({
  id: z.string().uuid(),
});

// Mark all read schema
export const markAllReadSchema = z.object({
  userId: z.string().uuid(),
  before: z.string().datetime().optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    voteReminder: z.boolean().default(true),
    voteResult: z.boolean().default(true),
    billStatusChange: z.boolean().default(true),
    billPassed: z.boolean().default(true),
    billFailed: z.boolean().default(true),
    billSunsetWarning: z.boolean().default(true),
    delegationReceived: z.boolean().default(true),
    delegationUsed: z.boolean().default(true),
    complianceIssue: z.boolean().default(true),
    amendmentProposed: z.boolean().default(true),
    accountSecurity: z.boolean().default(true),
    systemAnnouncement: z.boolean().default(true),
  }).optional(),
  push: z.object({
    enabled: z.boolean().default(true),
    voteReminder: z.boolean().default(true),
    voteResult: z.boolean().default(true),
    billStatusChange: z.boolean().default(false),
    delegationReceived: z.boolean().default(true),
    accountSecurity: z.boolean().default(true),
    systemAnnouncement: z.boolean().default(true),
  }).optional(),
  websocket: z.object({
    enabled: z.boolean().default(true),
  }).optional(),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string().default('UTC'),
  }).optional(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

// Push subscription schema
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  expirationTime: z.number().nullable().optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

// Register push subscription schema
export const registerPushSchema = z.object({
  userId: z.string().uuid(),
  subscription: pushSubscriptionSchema,
  userAgent: z.string().optional(),
});

// Unregister push subscription schema
export const unregisterPushSchema = z.object({
  userId: z.string().uuid(),
  endpoint: z.string().url(),
});

// Delete notification schema
export const deleteNotificationSchema = z.object({
  id: z.string().uuid(),
});

// Broadcast notification schema (admin)
export const broadcastNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  data: z.record(z.unknown()).optional(),
  regionId: z.string().uuid().optional(), // If specified, only broadcast to region
  channels: z.array(deliveryChannelSchema).default(['websocket']),
});

export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;
