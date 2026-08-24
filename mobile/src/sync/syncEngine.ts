import { SyncQueueItem } from '../storage/types';

export class SyncEngine {
  private queue: SyncQueueItem[] = [];

  public getQueue(): SyncQueueItem[] {
    return this.queue;
  }

  public enqueue(item: SyncQueueItem): void {
    this.queue.push(item);
  }

  public async processQueue(): Promise<void> {
    // Architecture placeholder for offline synchronization loop
  }
}

export const syncEngine = new SyncEngine();
