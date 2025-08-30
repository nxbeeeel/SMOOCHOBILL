import { Server, Socket } from 'socket.io';
import { WebSocketMessage } from '../types';
import databaseManager from '../database';

export const setupWebSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', async (token: string) => {
      try {
        // Verify token and get user info
        // This is a simplified version - in production, you'd verify JWT
        socket.data.authenticated = true;
        socket.emit('authenticated', { success: true });
      } catch (error) {
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    });

    // Handle order updates
    socket.on('order_update', async (data: any) => {
      try {
        // Broadcast order update to all connected clients
        io.emit('order_updated', {
          type: 'order_update',
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling order update:', error);
      }
    });

    // Handle inventory updates
    socket.on('inventory_update', async (data: any) => {
      try {
        // Broadcast inventory update to all connected clients
        io.emit('inventory_updated', {
          type: 'inventory_update',
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling inventory update:', error);
      }
    });

    // Handle sync status updates
    socket.on('sync_status', async (data: any) => {
      try {
        // Broadcast sync status to all connected clients
        io.emit('sync_status_updated', {
          type: 'sync_status',
          data,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling sync status:', error);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast functions for server-side events
  const broadcastOrderUpdate = (orderData: any) => {
    const message: WebSocketMessage = {
      type: 'order_update',
      data: orderData,
      timestamp: new Date().toISOString()
    };
    io.emit('order_updated', message);
  };

  const broadcastInventoryUpdate = (inventoryData: any) => {
    const message: WebSocketMessage = {
      type: 'inventory_update',
      data: inventoryData,
      timestamp: new Date().toISOString()
    };
    io.emit('inventory_updated', message);
  };

  const broadcastAlert = (alertData: any) => {
    const message: WebSocketMessage = {
      type: 'alert',
      data: alertData,
      timestamp: new Date().toISOString()
    };
    io.emit('alert_received', message);
  };

  const broadcastSyncStatus = (syncData: any) => {
    const message: WebSocketMessage = {
      type: 'sync_status',
      data: syncData,
      timestamp: new Date().toISOString()
    };
    io.emit('sync_status_updated', message);
  };

  // Export broadcast functions for use in other modules
  return {
    broadcastOrderUpdate,
    broadcastInventoryUpdate,
    broadcastAlert,
    broadcastSyncStatus
  };
};
