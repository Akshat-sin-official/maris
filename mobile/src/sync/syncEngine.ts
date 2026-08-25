import { SyncQueueItem } from '../storage/types';
import { apiClient } from '../api/client';

type SyncListener = (queue: SyncQueueItem[]) => void;

export class SyncEngine {
  private queue: SyncQueueItem[] = [];
  private isSyncing = false;
  private listeners: SyncListener[] = [];
  private lastSyncedAt: string | null = null;

  public getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  public getLastSyncedAt(): string | null {
    return this.lastSyncedAt;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.push(listener);
    listener(this.getQueue());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const queueCopy = this.getQueue();
    this.listeners.forEach(listener => listener(queueCopy));
  }

  public enqueue(item: SyncQueueItem): void {
    this.queue.push(item);
    this.notify();
  }

  public clearSynced(): void {
    this.queue = this.queue.filter(item => item.status !== 'SYNCED');
    this.notify();
  }

  public async processQueue(): Promise<{ successCount: number; failCount: number }> {
    if (this.isSyncing) {
      return { successCount: 0, failCount: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failCount = 0;

    const pendingItems = this.queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');

    for (const item of pendingItems) {
      item.status = 'SYNCING';
      this.notify();

      try {
        if (item.type === 'OBSERVATION') {
          await apiClient.post('/observations', item.payload);
        } else if (item.type === 'EVIDENCE') {
          await apiClient.post('/evidence', item.payload);
        }
        item.status = 'SYNCED';
        successCount++;
      } catch {
        item.status = 'FAILED';
        item.retryCount += 1;
        failCount++;
      }
      this.notify();
    }

    if (pendingItems.length > 0 && failCount === 0) {
      this.lastSyncedAt = new Date().toISOString();
    }

    this.isSyncing = false;
    return { successCount, failCount };
  }
}

export const syncEngine = new SyncEngine();

