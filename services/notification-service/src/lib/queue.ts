/**
 * Notification Queue
 *
 * Bull queue for background processing of notifications.
 */

import Bull, { Job, Queue } from 'bull';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId: string;
  notificationType: string;
}

export interface PushJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface BulkEmailJobData {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  notificationType: string;
}

export interface NotificationJobData {
  userId: string;
  notification: {
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  channels: ('websocket' | 'email' | 'push')[];
}

export type JobData = EmailJobData | PushJobData | BulkEmailJobData | NotificationJobData;

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Email queue
export const emailQueue: Queue<EmailJobData> = new Bull('email-notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Push notification queue
export const pushQueue: Queue<PushJobData> = new Bull('push-notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Bulk email queue
export const bulkEmailQueue: Queue<BulkEmailJobData> = new Bull('bulk-email-notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: 50,
    removeOnFail: 200,
  },
});

// General notification queue
export const notificationQueue: Queue<NotificationJobData> = new Bull('notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

/**
 * Add email job to queue
 */
export async function queueEmail(data: EmailJobData): Promise<Job<EmailJobData>> {
  return emailQueue.add(data, {
    priority: data.notificationType === 'ACCOUNT_SECURITY' ? 1 : 5,
  });
}

/**
 * Add push notification job to queue
 */
export async function queuePush(data: PushJobData): Promise<Job<PushJobData>> {
  return pushQueue.add(data);
}

/**
 * Add bulk email job to queue
 */
export async function queueBulkEmail(data: BulkEmailJobData): Promise<Job<BulkEmailJobData>> {
  return bulkEmailQueue.add(data);
}

/**
 * Add notification job to queue
 */
export async function queueNotification(data: NotificationJobData): Promise<Job<NotificationJobData>> {
  return notificationQueue.add(data);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  email: { waiting: number; active: number; completed: number; failed: number };
  push: { waiting: number; active: number; completed: number; failed: number };
  bulkEmail: { waiting: number; active: number; completed: number; failed: number };
  notification: { waiting: number; active: number; completed: number; failed: number };
}> {
  const [emailStats, pushStats, bulkEmailStats, notificationStats] = await Promise.all([
    getQueueJobCounts(emailQueue),
    getQueueJobCounts(pushQueue),
    getQueueJobCounts(bulkEmailQueue),
    getQueueJobCounts(notificationQueue),
  ]);

  return {
    email: emailStats,
    push: pushStats,
    bulkEmail: bulkEmailStats,
    notification: notificationStats,
  };
}

async function getQueueJobCounts(queue: Queue): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return { waiting, active, completed, failed };
}

/**
 * Close all queues
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([
    emailQueue.close(),
    pushQueue.close(),
    bulkEmailQueue.close(),
    notificationQueue.close(),
  ]);
}
