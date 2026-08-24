import { apiClient } from './client';

export const observationsApi = {
  getObservations: async () => apiClient.get('/observations'),
  getObservationById: async (id: string) => apiClient.get(`/observations/${id}`),
};
