import { FastifyInstance } from 'fastify';
import {
  RealTimeVotingData,
  RealTimeSystemHealth,
  RealTimeEngagement,
} from '../types/index.js';

export async function realtimeRoutes(app: FastifyInstance) {
  // WebSocket endpoint for real-time data streaming
  app.get('/stream', { websocket: true }, (connection, req) => {
    const socket = connection.socket;

    console.log('Client connected to analytics stream');

    // Send initial connection confirmation
    socket.send(JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString(),
    }));

    // Simulate real-time data updates
    const intervals: NodeJS.Timeout[] = [];

    // Voting data updates (every 2 seconds)
    intervals.push(
      setInterval(() => {
        const votingData: RealTimeVotingData = {
          sessionId: 'VS-2024-157',
          currentTally: {
            yes: Math.floor(Math.random() * 1000) + 5000,
            no: Math.floor(Math.random() * 500) + 2000,
            abstain: Math.floor(Math.random() * 100) + 200,
          },
          participationRate: 65 + Math.random() * 10,
          recentVotes: Math.floor(Math.random() * 50),
        };

        socket.send(JSON.stringify({
          type: 'voting:live',
          data: votingData,
          timestamp: new Date().toISOString(),
        }));
      }, 2000)
    );

    // System health updates (every 5 seconds)
    intervals.push(
      setInterval(() => {
        const healthData: RealTimeSystemHealth = {
          apiLatency: 40 + Math.random() * 20,
          activeUsers: 3000 + Math.floor(Math.random() * 500),
          queueDepth: 100 + Math.floor(Math.random() * 50),
          errorRate: Math.random() * 0.5,
        };

        socket.send(JSON.stringify({
          type: 'system:health',
          data: healthData,
          timestamp: new Date().toISOString(),
        }));
      }, 5000)
    );

    // Engagement updates (every 3 seconds)
    intervals.push(
      setInterval(() => {
        const engagementData: RealTimeEngagement = {
          activeUsers: 3000 + Math.floor(Math.random() * 500),
          billsViewed: Math.floor(Math.random() * 100),
          searchQueries: Math.floor(Math.random() * 50),
        };

        socket.send(JSON.stringify({
          type: 'engagement:live',
          data: engagementData,
          timestamp: new Date().toISOString(),
        }));
      }, 3000)
    );

    // Handle incoming messages
    socket.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle subscription requests
        if (data.type === 'subscribe') {
          socket.send(JSON.stringify({
            type: 'subscribed',
            channels: data.channels,
          }));
        }

        // Handle unsubscribe requests
        if (data.type === 'unsubscribe') {
          socket.send(JSON.stringify({
            type: 'unsubscribed',
            channels: data.channels,
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Cleanup on disconnect
    socket.on('close', () => {
      console.log('Client disconnected from analytics stream');
      intervals.forEach(clearInterval);
    });

    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      intervals.forEach(clearInterval);
    });
  });
}
