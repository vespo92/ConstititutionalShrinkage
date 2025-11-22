/**
 * WebSocket Channel
 *
 * Real-time notifications via Socket.IO.
 */

import { Server, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { Notification } from '../index.js';

export class WebSocketChannel {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        this.registerUser(userId, socket.id);
        socket.join(`user:${userId}`);
        socket.emit('authenticated', { userId, socketId: socket.id });
        console.log(`User ${userId} authenticated on socket ${socket.id}`);
      });

      // Handle room subscriptions
      socket.on('subscribe:region', (regionId: string) => {
        socket.join(`region:${regionId}`);
        socket.emit('subscribed', { type: 'region', id: regionId });
      });

      socket.on('subscribe:bill', (billId: string) => {
        socket.join(`bill:${billId}`);
        socket.emit('subscribed', { type: 'bill', id: billId });
      });

      socket.on('unsubscribe:region', (regionId: string) => {
        socket.leave(`region:${regionId}`);
      });

      socket.on('unsubscribe:bill', (billId: string) => {
        socket.leave(`bill:${billId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.unregisterSocket(socket.id);
        console.log(`Socket disconnected: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (err) => {
        console.error(`Socket error on ${socket.id}:`, err);
      });
    });
  }

  private registerUser(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private unregisterSocket(socketId: string): void {
    for (const [userId, sockets] of this.userSockets) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  /**
   * Send notification to a specific user
   */
  async send(userId: string, notification: Notification): Promise<void> {
    this.io.to(`user:${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.createdAt,
    });
  }

  /**
   * Send notification to all users in a region
   */
  async sendToRegion(regionId: string, notification: Partial<Notification>): Promise<void> {
    this.io.to(`region:${regionId}`).emit('notification', notification);
  }

  /**
   * Send notification to all users watching a bill
   */
  async sendToBill(billId: string, notification: Partial<Notification>): Promise<void> {
    this.io.to(`bill:${billId}`).emit('notification', notification);
  }

  /**
   * Broadcast to all connected users
   */
  async broadcast(notification: Partial<Notification>): Promise<void> {
    this.io.emit('notification', notification);
  }

  /**
   * Send vote update to bill watchers
   */
  async sendVoteUpdate(billId: string, results: {
    for: number;
    against: number;
    abstain: number;
    quorumMet: boolean;
  }): Promise<void> {
    this.io.to(`bill:${billId}`).emit('vote-update', {
      billId,
      results,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get current connection count
   */
  getConnectionCount(): number {
    return this.io.engine.clientsCount;
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}
