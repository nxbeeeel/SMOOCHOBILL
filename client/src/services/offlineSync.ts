import { useOfflineStore } from '../store/offlineStore';

export const initializeOfflineSync = () => {
  console.log('Initializing offline sync...');
  
  // Check if IndexedDB is available
  if (!window.indexedDB) {
    console.warn('IndexedDB not supported, offline functionality will be limited');
    return;
  }

  // Initialize IndexedDB for offline storage
  const request = indexedDB.open('SmoochoPOS', 1);

  request.onerror = (event) => {
    console.error('Failed to open IndexedDB:', event);
  };

  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    console.log('IndexedDB opened successfully');
    
    // Store database reference for later use
    (window as any).smoochoDB = db;
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    
    // Create object stores for offline data
    if (!db.objectStoreNames.contains('orders')) {
      const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
      orderStore.createIndex('timestamp', 'timestamp', { unique: false });
      orderStore.createIndex('status', 'status', { unique: false });
    }

    if (!db.objectStoreNames.contains('inventory')) {
      const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
      inventoryStore.createIndex('name', 'name', { unique: false });
      inventoryStore.createIndex('category', 'category', { unique: false });
    }

    if (!db.objectStoreNames.contains('products')) {
      const productStore = db.createObjectStore('products', { keyPath: 'id' });
      productStore.createIndex('category_id', 'category_id', { unique: false });
      productStore.createIndex('name', 'name', { unique: false });
    }

    if (!db.objectStoreNames.contains('syncQueue')) {
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      syncStore.createIndex('type', 'type', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    console.log('IndexedDB schema created');
  };
};

export const saveOrderOffline = async (order: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = (window as any).smoochoDB;
    if (!db) {
      reject(new Error('IndexedDB not initialized'));
      return;
    }

    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    
    const request = store.add({
      ...order,
      timestamp: new Date().toISOString(),
      offline: true,
    });

    request.onsuccess = () => {
      console.log('Order saved offline:', order.id);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save order offline'));
    };
  });
};

export const getOfflineOrders = async (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const db = (window as any).smoochoDB;
    if (!db) {
      reject(new Error('IndexedDB not initialized'));
      return;
    }

    const transaction = db.transaction(['orders'], 'readonly');
    const store = transaction.objectStore('orders');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error('Failed to get offline orders'));
    };
  });
};

export const syncOfflineData = async (): Promise<void> => {
  const { isOnline } = useOfflineStore.getState();
  
  if (!isOnline) {
    console.log('Still offline, skipping sync');
    return;
  }

  try {
    const offlineOrders = await getOfflineOrders();
    
    for (const order of offlineOrders) {
      try {
        // Attempt to sync order to server
        // This would be implemented when we create the order service
        console.log('Syncing order:', order.id);
        
        // Remove from offline storage after successful sync
        await removeOfflineOrder(order.id);
      } catch (error) {
        console.error('Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
};

export const removeOfflineOrder = async (orderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = (window as any).smoochoDB;
    if (!db) {
      reject(new Error('IndexedDB not initialized'));
      return;
    }

    const transaction = db.transaction(['orders'], 'readwrite');
    const store = transaction.objectStore('orders');
    const request = store.delete(orderId);

    request.onsuccess = () => {
      console.log('Offline order removed:', orderId);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to remove offline order'));
    };
  });
};

export const addToSyncQueue = async (type: string, data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = (window as any).smoochoDB;
    if (!db) {
      reject(new Error('IndexedDB not initialized'));
      return;
    }

    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const request = store.add({
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    request.onsuccess = () => {
      console.log('Added to sync queue:', type);
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to add to sync queue'));
    };
  });
};
