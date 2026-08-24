const BASE_URL = '/api/v1';

function getHeaders() {
  const token = localStorage.getItem('maris_jwt_token');
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
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`POST ${endpoint} failed: ${res.statusText} ${errText}`);
    }
    return res.json();
  },

  async patch(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`PATCH ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${res.statusText}`);
    }
    return res.json();
  }
};
