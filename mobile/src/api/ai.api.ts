import { apiClient } from './client';
import { AIQueryRequest, AIQueryResponse } from '../types';

export const aiApi = {
  query: async (data: AIQueryRequest) => apiClient.post<AIQueryResponse>('/ai/query', data),
};
