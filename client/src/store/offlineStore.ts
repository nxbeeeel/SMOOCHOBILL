import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineState {
  isOnline: boolean;
  pendingOrders: any[];
  pendingInventoryUpdates: any[];
  lastSyncTime: string | null;
  syncErrors: string[];
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  checkOnlineStatus: () => void;
  addPendingOrder: (order: any) => void;
  removePendingOrder: (orderId: string) => void;
  addPendingInventoryUpdate: (update: any) => void;
  removePendingInventoryUpdate: (updateId: string) => void;
  setLastSyncTime: (time: string) => void;
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
  clearAllPendingData: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      pendingOrders: [],
      pendingInventoryUpdates: [],
      lastSyncTime: null,
      syncErrors: [],

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      checkOnlineStatus: () => {
        const isOnline = navigator.onLine;
        set({ isOnline });
        
        // If coming back online, trigger sync
        if (isOnline && get().pendingOrders.length > 0) {
          // Trigger sync in background
          setTimeout(() => {
            // This would trigger the sync process
            console.log('Triggering sync for pending data...');
          }, 1000);
        }
      },

      addPendingOrder: (order: any) => {
        set((state) => ({
          pendingOrders: [...state.pendingOrders, { ...order, id: Date.now().toString() }],
        }));
      },

      removePendingOrder: (orderId: string) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.filter((order) => order.id !== orderId),
        }));
      },

      addPendingInventoryUpdate: (update: any) => {
        set((state) => ({
          pendingInventoryUpdates: [...state.pendingInventoryUpdates, { ...update, id: Date.now().toString() }],
        }));
      },

      removePendingInventoryUpdate: (updateId: string) => {
        set((state) => ({
          pendingInventoryUpdates: state.pendingInventoryUpdates.filter((update) => update.id !== updateId),
        }));
      },

      setLastSyncTime: (time: string) => {
        set({ lastSyncTime: time });
      },

      addSyncError: (error: string) => {
        set((state) => ({
          syncErrors: [...state.syncErrors, `${new Date().toISOString()}: ${error}`],
        }));
      },

      clearSyncErrors: () => {
        set({ syncErrors: [] });
      },

      clearAllPendingData: () => {
        set({
          pendingOrders: [],
          pendingInventoryUpdates: [],
          syncErrors: [],
        });
      },
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        pendingOrders: state.pendingOrders,
        pendingInventoryUpdates: state.pendingInventoryUpdates,
        lastSyncTime: state.lastSyncTime,
        syncErrors: state.syncErrors,
      }),
    }
  )
);
