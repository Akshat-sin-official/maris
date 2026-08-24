import { apiClient } from './client';

export const syncApi = {
  syncBatch: async (batchData: { incidents?: any[]; evidences?: any[] }) => apiClient.post('/sync/batch', batchData),
};
