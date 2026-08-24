const BASE_URL = '/api/v1';

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
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
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
    return res.json();
  },

  async patch(endpoint: string, data: any) {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`PATCH ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(endpoint: string) {
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
