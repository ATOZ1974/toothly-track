import { useEffect, useState } from 'react';
import Dexie, { Table } from 'dexie';
import { PatientRecord } from '@/types/dental';

// Define database schema
class ToothlyDB extends Dexie {
  patients!: Table<PatientRecord>;
  syncQueue!: Table<{ id?: number; action: string; data: any; timestamp: number }>;

  constructor() {
    super('ToothlyDB');
    this.version(1).stores({
      patients: 'id, savedAt',
      syncQueue: '++id, timestamp'
    });
  }
}

const db = new ToothlyDB();

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync items
    db.syncQueue.count().then(setPendingSync);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOffline = async (record: PatientRecord) => {
    try {
      await db.patients.put(record);
      await db.syncQueue.add({
        action: 'save',
        data: record,
        timestamp: Date.now()
      });
      setPendingSync(await db.syncQueue.count());
      return true;
    } catch (error) {
      console.error('Failed to save offline:', error);
      return false;
    }
  };

  const getOfflinePatients = async () => {
    try {
      return await db.patients.toArray();
    } catch (error) {
      console.error('Failed to get offline patients:', error);
      return [];
    }
  };

  const syncWithServer = async (syncFn: (data: any) => Promise<void>) => {
    if (!isOnline) return;

    try {
      const items = await db.syncQueue.toArray();
      for (const item of items) {
        await syncFn(item.data);
        await db.syncQueue.delete(item.id!);
      }
      setPendingSync(0);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const clearOfflineData = async () => {
    try {
      await db.patients.clear();
      await db.syncQueue.clear();
      setPendingSync(0);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };

  return {
    isOnline,
    pendingSync,
    saveOffline,
    getOfflinePatients,
    syncWithServer,
    clearOfflineData
  };
}
