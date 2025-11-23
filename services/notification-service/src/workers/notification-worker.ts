/**
 * Notification Worker
 *
 * Background job processor for notifications.
 */

import { Job } from 'bull';
import {
  emailQueue,
  pushQueue,
  bulkEmailQueue,
  notificationQueue,
  EmailJobData,
  PushJobData,
  BulkEmailJobData,
  NotificationJobData,
} from '../lib/queue.js';
import { EmailChannel } from '../channels/email.js';
import { PushChannel } from '../channels/push.js';
import { RedisPubSub } from '../lib/redis-pubsub.js';
import prisma from '../lib/prisma.js';

// Initialize channels
const emailChannel = new EmailChannel();
const pushChannel = new PushChannel();
const pubsub = new RedisPubSub();

/**
 * Process email jobs
 */
emailQueue.process(async (job: Job<EmailJobData>) => {
  const { to, subject, html, text, userId, notificationType } = job.data;

  console.log(`Processing email job ${job.id} for user ${userId}`);

  try {
    await emailChannel.send({ to, subject, html, text });

    // Log successful delivery
    await logDelivery(userId, 'email', notificationType, 'success');

    return { success: true, recipient: to };
  } catch (err) {
    console.error(`Email job ${job.id} failed:`, err);

    // Log failed delivery
    await logDelivery(userId, 'email', notificationType, 'failed', String(err));

    throw err;
  }
});

/**
 * Process push notification jobs
 */
pushQueue.process(async (job: Job<PushJobData>) => {
  const { userId, title, body, data } = job.data;

  console.log(`Processing push job ${job.id} for user ${userId}`);

  try {
    await pushChannel.send(userId, { title, body, data });

    // Log successful delivery
    await logDelivery(userId, 'push', data?.type as string || 'unknown', 'success');

    return { success: true, userId };
  } catch (err) {
    console.error(`Push job ${job.id} failed:`, err);

    // Log failed delivery
    await logDelivery(userId, 'push', data?.type as string || 'unknown', 'failed', String(err));

    throw err;
  }
});

/**
 * Process bulk email jobs
 */
bulkEmailQueue.process(async (job: Job<BulkEmailJobData>) => {
  const { recipients, subject, html, text, notificationType } = job.data;

  console.log(`Processing bulk email job ${job.id} for ${recipients.length} recipients`);

  try {
    await emailChannel.sendBulk(recipients, { subject, html, text });

    return { success: true, recipientCount: recipients.length };
  } catch (err) {
    console.error(`Bulk email job ${job.id} failed:`, err);
    throw err;
  }
});

/**
 * Process general notification jobs
 */
notificationQueue.process(async (job: Job<NotificationJobData>) => {
  const { userId, notification, channels } = job.data;

  console.log(`Processing notification job ${job.id} for user ${userId}`);

  try {
    // Create notification record in database
    const notificationRecord = await createNotificationRecord(userId, notification);

    // Dispatch to channels
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'websocket':
            await pubsub.publishNotification(userId, {
              id: notificationRecord.id,
              type: notification.type,
              title: notification.title,
              body: notification.body,
              data: notification.data,
              createdAt: notificationRecord.createdAt,
            });
            break;

          case 'email':
            // Get user email from database
            const user = await getUserWithEmail(userId);
            if (user?.email) {
              await emailQueue.add({
                to: user.email,
                subject: notification.title,
                html: `<p>${notification.body}</p>`,
                userId,
                notificationType: notification.type,
              });
            }
            break;

          case 'push':
            await pushQueue.add({
              userId,
              title: notification.title,
              body: notification.body,
              data: { ...notification.data, type: notification.type },
            });
            break;
        }
      } catch (channelErr) {
        console.error(`Failed to dispatch to ${channel}:`, channelErr);
      }
    }

    return { success: true, notificationId: notificationRecord.id };
  } catch (err) {
    console.error(`Notification job ${job.id} failed:`, err);
    throw err;
  }
});

/**
 * Create notification record in database
 */
async function createNotificationRecord(
  userId: string,
  notification: NotificationJobData['notification']
): Promise<{ id: string; createdAt: Date }> {
  // For now, return a mock record since we don't have the actual schema
  // In production, this would use Prisma to create the record
  const id = crypto.randomUUID();
  const createdAt = new Date();

  // TODO: Uncomment when Notification model is available in Prisma schema
  // const record = await prisma.notification.create({
  //   data: {
  //     userId,
  //     type: notification.type,
  //     title: notification.title,
  //     body: notification.body,
  //     data: notification.data,
  //   },
  // });

  return { id, createdAt };
}

/**
 * Get user with email from database
 */
async function getUserWithEmail(userId: string): Promise<{ email: string } | null> {
  // TODO: Implement actual database lookup
  // const user = await prisma.person.findUnique({
  //   where: { id: userId },
  //   select: { email: true },
  // });
  // return user;
  return null;
}

/**
 * Log notification delivery attempt
 */
async function logDelivery(
  userId: string,
  channel: string,
  notificationType: string,
  status: 'success' | 'failed',
  error?: string
): Promise<void> {
  // TODO: Implement delivery logging
  // await prisma.notificationDelivery.create({
  //   data: {
  //     userId,
  //     channel,
  //     notificationType,
  //     status,
  //     error,
  //   },
  // });
  console.log(`Delivery log: ${channel} ${notificationType} ${status} for ${userId}`);
}

// Event handlers for queue events
emailQueue.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

pushQueue.on('completed', (job) => {
  console.log(`Push job ${job.id} completed`);
});

pushQueue.on('failed', (job, err) => {
  console.error(`Push job ${job?.id} failed:`, err);
});

notificationQueue.on('completed', (job) => {
  console.log(`Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

console.log('Notification worker started');

export { emailQueue, pushQueue, bulkEmailQueue, notificationQueue };
