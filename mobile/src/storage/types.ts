export type SyncState = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface LocalObservation {
  localId: string;
  clientId: string;
  category: string;
  value: string;
  coordinates: [number, number];
  notes?: string;
  capturedAt: string;
  syncState: SyncState;
}

export interface LocalEvidence {
  localEvidenceId: string;
  clientId: string;
  parentClientId: string; // References local incident or observation ID
  localFilePath: string;
  mimeType: string;
  capturedAt: string;
  syncState: SyncState;
}

export interface SyncQueueItem {
  id: string;
  type: 'OBSERVATION' | 'EVIDENCE';
  payload: any;
  retryCount: number;
  status: SyncState;
  createdAt: string;
}
