import { Server } from 'socket.io';
export declare const setupWebSocket: (io: Server) => {
    broadcastOrderUpdate: (orderData: any) => void;
    broadcastInventoryUpdate: (inventoryData: any) => void;
    broadcastAlert: (alertData: any) => void;
    broadcastSyncStatus: (syncData: any) => void;
};
//# sourceMappingURL=websocket.d.ts.map