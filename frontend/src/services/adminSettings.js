const API_URL = '/api/admin';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API call failed');
  }
  return response.json();
};

export async function getSettings() {
  return apiCall('/settings');
}

export async function updateSettings(settings) {
  return apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function generateInviteToken(role) {
  return apiCall('/invite-token', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function getAllInviteTokens(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/invite-tokens${queryString ? `?${queryString}` : ''}`);
} 