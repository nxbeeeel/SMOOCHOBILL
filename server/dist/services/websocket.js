"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = void 0;
const setupWebSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        socket.on('authenticate', async (token) => {
            try {
                socket.data.authenticated = true;
                socket.emit('authenticated', { success: true });
            }
            catch (error) {
                socket.emit('authenticated', { success: false, error: 'Invalid token' });
            }
        });
        socket.on('order_update', async (data) => {
            try {
                io.emit('order_updated', {
                    type: 'order_update',
                    data,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling order update:', error);
            }
        });
        socket.on('inventory_update', async (data) => {
            try {
                io.emit('inventory_updated', {
                    type: 'inventory_update',
                    data,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling inventory update:', error);
            }
        });
        socket.on('sync_status', async (data) => {
            try {
                io.emit('sync_status_updated', {
                    type: 'sync_status',
                    data,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling sync status:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
    const broadcastOrderUpdate = (orderData) => {
        const message = {
            type: 'order_update',
            data: orderData,
            timestamp: new Date().toISOString()
        };
        io.emit('order_updated', message);
    };
    const broadcastInventoryUpdate = (inventoryData) => {
        const message = {
            type: 'inventory_update',
            data: inventoryData,
            timestamp: new Date().toISOString()
        };
        io.emit('inventory_updated', message);
    };
    const broadcastAlert = (alertData) => {
        const message = {
            type: 'alert',
            data: alertData,
            timestamp: new Date().toISOString()
        };
        io.emit('alert_received', message);
    };
    const broadcastSyncStatus = (syncData) => {
        const message = {
            type: 'sync_status',
            data: syncData,
            timestamp: new Date().toISOString()
        };
        io.emit('sync_status_updated', message);
    };
    return {
        broadcastOrderUpdate,
        broadcastInventoryUpdate,
        broadcastAlert,
        broadcastSyncStatus
    };
};
exports.setupWebSocket = setupWebSocket;
//# sourceMappingURL=websocket.js.map