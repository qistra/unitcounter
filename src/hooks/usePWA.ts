import { useState, useEffect } from 'react';

interface PWAState {
  isOnline: boolean;
  needsRefresh: boolean;
  offlineReady: boolean;
}

interface StoredCalculation {
  timestamp: number;
  personalUsage: number | null;
  sharedUsage?: {
    initiallyRechargedUnits: number;
    currentRemainingUnits: number;
    totalSharedUsage: number;
    othersUsage: number;
  };
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    needsRefresh: false,
    offlineReady: false,
  });

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setState(s => ({ ...s, isOnline: true }));
    const handleOffline = () => setState(s => ({ ...s, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerUpdate = (event: MessageEvent) => {
        const { type, message } = event.data || {};
        
        if (type === 'SW_UPDATED') {
          console.log('New content available:', message);
          setState(s => ({ ...s, needsRefresh: true }));
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerUpdate);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerUpdate);
      };
    }
  }, []);

  // Function to update the service worker
  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        // Send message to service worker to skip waiting and activate new version
        registration.waiting.postMessage('SKIP_WAITING');
        window.location.reload();
      }
    }
  };

  // Function to store calculation in IndexedDB
  const storeCalculation = async (calculation: StoredCalculation) => {
    try {
      const db = await openDB();
      const tx = db.transaction('calculations', 'readwrite');
      const store = tx.objectStore('calculations');
      await new Promise<void>((resolve, reject) => {
        const request = store.add(calculation);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Failed to store calculation:', error);
    }
  };

  // Function to get stored calculations
  const getStoredCalculations = async (): Promise<StoredCalculation[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction('calculations', 'readonly');
      const store = tx.objectStore('calculations');
      return new Promise<StoredCalculation[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as StoredCalculation[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get calculations:', error);
      return [];
    }
  };

  return {
    ...state,
    updateServiceWorker,
    storeCalculation,
    getStoredCalculations,
  };
};

// Helper function to open IndexedDB
const openDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('wattshare-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('calculations')) {
        db.createObjectStore('calculations', {
          keyPath: 'timestamp',
          autoIncrement: false,
        });
      }
    };
  });
}; 