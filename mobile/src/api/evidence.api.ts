import { apiClient } from './client';

export const evidenceApi = {
  getEvidenceById: async (id: string) => apiClient.get(`/evidence/${id}`),
  getAccessUrl: async (id: string) => apiClient.get(`/evidence/${id}/access`),
};
