import { apiClient } from './client';

export interface SubmitTipPayload {
  category: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  clientMetadata: {
    deviceType: string;
    os: string;
    screenResolution: string;
    timezone: string;
  };
}

export const tipsApi = {
  submitTip: async (payload: SubmitTipPayload) => apiClient.post('/tips/submit', payload),
  trackTip: async (tipsterId: string) => apiClient.get(`/tips/track/${tipsterId}`),
};
