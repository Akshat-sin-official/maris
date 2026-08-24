import { apiClient } from './client';
import { IntelligenceLookupResponse } from '../types';

export const intelligenceApi = {
  lookupByCoordinates: async (lat: number, lng: number) =>
    apiClient.get<IntelligenceLookupResponse>(`/intelligence/lookup?lat=${lat}&lng=${lng}`),
};
