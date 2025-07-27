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

export async function getSupportTickets(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/support${queryString ? `?${queryString}` : ''}`);
}

export async function replySupportTicket(id, message, files, token) {
  const formData = new FormData();
  formData.append('message', message);
  if (files && files.length) {
    for (let f of files) formData.append('files', f);
  }
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/support/${id}/reply`, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: formData
  });
  if (!res.ok) throw new Error('Failed to reply to support ticket');
  return res.json();
}

export async function closeSupportTicket(id) {
  const res = await fetch(`${API_URL}/support/${id}/close`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to close support ticket');
  return res.json();
} 