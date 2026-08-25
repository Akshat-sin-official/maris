import { ENV } from '../constants/env';

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

let userToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  userToken = token;
};

export const getAuthToken = () => userToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const url = `${ENV.API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const err: ApiError = {
        message: response.statusText || 'API Request Failed',
        statusCode: response.status,
        details: errorText,
      };
      throw err;
    }

    return await response.json();
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw {
      message: error.message || 'Network unavailable or connection timeout.',
      statusCode: 0,
    } as ApiError;
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
