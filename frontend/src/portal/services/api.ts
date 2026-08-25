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
      console.warn('Auto-token issuance check notice:', err);
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

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
    });

    const bodyText = await res.text();
    let bodyJson: any;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { message: bodyText };
    }

    if (!res.ok) {
      console.warn(`Live API GET ${endpoint} returned status ${res.status}:`, bodyJson);
      // Return JSON payload if available so page components can handle status safely
      return bodyJson;
    }
    return bodyJson;
  },

  async post(endpoint: string, data: any) {
    const cleanEndpoint = endpoint.split('?')[0];

    if (isSimulatedMode()) {
      if (cleanEndpoint === '/users') {
        const newUsr = {
          _id: data._id || `usr-sim-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          organization: data.organization || 'MARIS Command Center',
          badgeNumber: data.badgeNumber || `MARIS-${Date.now().toString().slice(-4)}`,
          isActive: true,
        };
        SIMULATED_USERS.unshift(newUsr);
        return { status: 'success', message: 'User created successfully', data: { user: newUsr } };
      }
      return { status: 'success', message: 'Simulated operation recorded successfully', data };
    }

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const bodyText = await res.text();
    let bodyJson: any;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { message: bodyText };
    }

    if (!res.ok) {
      throw new Error(bodyJson.message || `POST ${endpoint} failed with HTTP ${res.status}`);
    }
    return bodyJson;
  },

  async patch(endpoint: string, data: any) {
    const cleanEndpoint = endpoint.split('?')[0];

    if (isSimulatedMode()) {
      if (cleanEndpoint.startsWith('/users/')) {
        const userId = cleanEndpoint.split('/')[2];
        const usrIndex = SIMULATED_USERS.findIndex((u) => u._id === userId || (u as any).id === userId);
        if (usrIndex !== -1) {
          SIMULATED_USERS[usrIndex] = { ...SIMULATED_USERS[usrIndex], ...data };
        }
      }
      return { status: 'success', message: 'Simulated patch recorded', data };
    }

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    const bodyText = await res.text();
    let bodyJson: any;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { message: bodyText };
    }

    if (!res.ok) {
      throw new Error(bodyJson.message || `PATCH ${endpoint} failed with HTTP ${res.status}`);
    }
    return bodyJson;
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

    const bodyText = await res.text();
    let bodyJson: any;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch {
      bodyJson = { message: bodyText };
    }

    if (!res.ok) {
      throw new Error(bodyJson.message || `DELETE ${endpoint} failed with HTTP ${res.status}`);
    }
    return bodyJson;
  },
};
