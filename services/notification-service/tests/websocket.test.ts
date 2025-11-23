/**
 * WebSocket Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketChannel } from '../src/channels/websocket.js';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';

describe('WebSocket Channel', () => {
  let httpServer: HttpServer;
  let wsChannel: WebSocketChannel;
  let port: number;

  beforeEach(async () => {
    httpServer = createServer();
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
    wsChannel = new WebSocketChannel(httpServer);
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  describe('Connection Management', () => {
    it('should start with zero connections', () => {
      expect(wsChannel.getConnectionCount()).toBe(0);
    });

    it('should start with zero online users', () => {
      expect(wsChannel.getOnlineUserCount()).toBe(0);
    });

    it('should report user as offline when not connected', () => {
      expect(wsChannel.isUserOnline('non-existent-user')).toBe(false);
    });
  });

  describe('Message Sending', () => {
    it('should send notification to user room', async () => {
      const notification = {
        id: 'test-id',
        type: 'VOTE_AVAILABLE' as const,
        userId: 'test-user',
        title: 'Test',
        body: 'Test body',
        channels: ['websocket' as const],
        read: false,
        createdAt: new Date(),
      };

      // This should not throw even with no connected clients
      await expect(wsChannel.send('test-user', notification)).resolves.toBeUndefined();
    });

    it('should broadcast to all clients', async () => {
      const notification = {
        type: 'SYSTEM_ALERT' as const,
        title: 'System Alert',
        body: 'System maintenance scheduled',
      };

      await expect(wsChannel.broadcast(notification)).resolves.toBeUndefined();
    });

    it('should send to region room', async () => {
      const notification = {
        type: 'REGION_ANNOUNCEMENT' as const,
        title: 'Regional Update',
        body: 'New legislation in your region',
      };

      await expect(wsChannel.sendToRegion('region-123', notification)).resolves.toBeUndefined();
    });

    it('should send to bill room', async () => {
      const notification = {
        type: 'BILL_UPDATE' as const,
        title: 'Bill Update',
        body: 'The bill has been amended',
      };

      await expect(wsChannel.sendToBill('bill-456', notification)).resolves.toBeUndefined();
    });

    it('should send vote updates', async () => {
      const results = {
        for: 100,
        against: 50,
        abstain: 10,
        quorumMet: true,
      };

      await expect(wsChannel.sendVoteUpdate('bill-789', results)).resolves.toBeUndefined();
    });
  });
});
