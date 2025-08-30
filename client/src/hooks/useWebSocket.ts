import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';
import { WS_URL } from '../config/api';

interface UseWebSocketReturn {
  connect: (token: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  sendMessage: (type: string, data: any) => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback((token: string) => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      isConnectedRef.current = true;
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      isConnectedRef.current = false;
    });

    socket.on('order_updated', (message: WebSocketMessage) => {
      console.log('Order updated:', message);
      // Handle order updates
    });

    socket.on('inventory_updated', (message: WebSocketMessage) => {
      console.log('Inventory updated:', message);
      // Handle inventory updates
    });

    socket.on('alert_received', (message: WebSocketMessage) => {
      console.log('Alert received:', message);
      // Handle alerts
    });

    socket.on('sync_status_updated', (message: WebSocketMessage) => {
      console.log('Sync status updated:', message);
      // Handle sync status updates
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: isConnectedRef.current,
    sendMessage,
  };
};
