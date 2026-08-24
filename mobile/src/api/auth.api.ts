import { apiClient } from './client';

export const authApi = {
  login: async (credentials: { email: string; pass: string }) => {
    return apiClient.post('/auth/login', credentials);
  },
  getMe: async () => {
    return apiClient.get('/auth/me');
  },
};
