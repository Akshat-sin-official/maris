import { apiClient } from './client';

export const alertsApi = {
  getAlerts: async () => apiClient.get('/alerts'),
};
