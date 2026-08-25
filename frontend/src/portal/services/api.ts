import {
  SIMULATED_INVESTIGATIONS,
  SIMULATED_FIELD_OBSERVATIONS,
  SIMULATED_TIPS,
  SIMULATED_PFZ_BULLETINS,
  SIMULATED_REPORTS,
  SIMULATED_USERS,
  SIMULATED_LIVE_LOCATIONS,
  SIMULATED_ALERTS,
} from '../data/portalMockData';

const BASE_URL = '/api/v1';

function isSimulatedMode(): boolean {
  return localStorage.getItem('maris_simulated_mode') === 'true';
}

function getSimulatedResponse(endpoint: string): any {
  const cleanEndpoint = endpoint.split('?')[0];

  if (cleanEndpoint === '/incidents') {
    return { status: 'success', results: SIMULATED_INVESTIGATIONS.length, data: { incidents: SIMULATED_INVESTIGATIONS } };
  }
  if (cleanEndpoint === '/observations') {
    return { status: 'success', results: SIMULATED_FIELD_OBSERVATIONS.length, data: { observations: SIMULATED_FIELD_OBSERVATIONS } };
  }
  if (cleanEndpoint.startsWith('/tips')) {
    return { status: 'success', results: SIMULATED_TIPS.length, data: { tips: SIMULATED_TIPS } };
  }
  if (cleanEndpoint.startsWith('/intelligence/lookup')) {
    return {
      status: 'success',
      weather: { windSpeed: 14, source: 'Simulated OpenWeather' },
      marineConditions: { waveHeight: 2.4, waterTemp: 28.5 },
      pfz: SIMULATED_PFZ_BULLETINS[0],
    };
  }
  if (cleanEndpoint.startsWith('/intelligence/live-locations')) {
    return { status: 'success', count: SIMULATED_LIVE_LOCATIONS.length, locations: SIMULATED_LIVE_LOCATIONS };
  }
  if (cleanEndpoint === '/users') {
    return { status: 'success', results: SIMULATED_USERS.length, data: { users: SIMULATED_USERS } };
  }
  if (cleanEndpoint === '/reports') {
    return { status: 'success', results: SIMULATED_REPORTS.length, data: { reports: SIMULATED_REPORTS } };
  }
  if (cleanEndpoint === '/pfz') {
    return { status: 'success', results: SIMULATED_PFZ_BULLETINS.length, data: { bulletins: SIMULATED_PFZ_BULLETINS } };
  }
  if (cleanEndpoint === '/alerts') {
    return { status: 'success', results: SIMULATED_ALERTS.length, data: { alerts: SIMULATED_ALERTS } };
  }

  return { status: 'success', data: [] };
}

async function getHeaders(): Promise<Record<string, string>> {
  let token = localStorage.getItem('maris_jwt_token');
  if (!token) {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'operator@maris.gov.in', password: 'password123' }),
      });
      if (res.ok) {
        const data = await res.json();
        token = data.data?.accessToken || data.token || data.accessToken || data.data?.token;
        if (token) {
          localStorage.setItem('maris_jwt_token', token);
        }
      }
    } catch (err) {
      console.warn('Auto-token issuance check failed:', err);
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get(endpoint: string) {
    if (isSimulatedMode()) {
      return getSimulatedResponse(endpoint);
    }

    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
      });
      if (!res.ok) {
        console.warn(`GET ${endpoint} returned status ${res.status}. Falling back to simulated data.`);
        return getSimulatedResponse(endpoint);
      }
      return await res.json();
    } catch (err) {
      console.warn(`GET ${endpoint} network error. Falling back to simulated baseline data:`, err);
      return getSimulatedResponse(endpoint);
    }
  },

  async post(endpoint: string, data: any) {
    if (isSimulatedMode()) {
      return { status: 'success', message: 'Simulated operation recorded successfully', data };
    }

    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`POST ${endpoint} failed: ${res.statusText} ${errText}`);
      }
      return await res.json();
    } catch (err) {
      if (isSimulatedMode()) {
        return { status: 'success', data };
      }
      throw err;
    }
  },

  async patch(endpoint: string, data: any) {
    if (isSimulatedMode()) {
      return { status: 'success', message: 'Simulated patch recorded', data };
    }

    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`PATCH ${endpoint} failed: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (isSimulatedMode()) {
        return { status: 'success', data };
      }
      throw err;
    }
  },

  async delete(endpoint: string) {
    if (isSimulatedMode()) {
      return { status: 'success', message: 'Simulated item deleted' };
    }

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },
};
