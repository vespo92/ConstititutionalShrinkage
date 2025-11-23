'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RealTimeOptions {
  enabled?: boolean;
  interval?: number;
}

interface RealTimeResult<T> {
  data: T | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  reconnect: () => void;
}

export function useRealTimeData<T>(
  endpoint: string,
  options: RealTimeOptions = {}
): RealTimeResult<T> {
  const { enabled = true, interval = 5000 } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // In production, this would connect to WebSocket or poll API
      // const response = await fetch(`/api/analytics/realtime/${endpoint}`);
      // const newData = await response.json();

      // Mock real-time data update
      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  }, [endpoint]);

  const connect = useCallback(() => {
    if (!enabled) return;

    fetchData();
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchData]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const reconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    connect();
  }, [connect]);

  return {
    data,
    isConnected,
    lastUpdated,
    reconnect,
  };
}
