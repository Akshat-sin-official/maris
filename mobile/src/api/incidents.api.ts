import { apiClient } from './client';

export const incidentsApi = {
  getIncidents: async () => apiClient.get('/incidents'),
  getIncidentById: async (id: string) => apiClient.get(`/incidents/${id}`),
};
