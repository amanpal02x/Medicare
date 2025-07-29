const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}/admin${endpoint}`;
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
  
  const url = `${API_BASE}/admin/support/${id}/reply`;
  const authToken = token || localStorage.getItem('token');
  const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  console.log('Sending admin reply:', { url, hasToken: !!authToken, message, filesCount: files?.length || 0 });
  
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: formData
  });
  
  console.log('Admin reply response:', { status: res.status, statusText: res.statusText });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    console.error('Admin reply error:', error);
    throw new Error(error.message || 'Failed to reply to support ticket');
  }
  return res.json();
}

export async function closeSupportTicket(id) {
  const url = `${API_BASE}/admin/support/${id}/close`;
  const token = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  const res = await fetch(url, { 
    method: 'PUT', 
    credentials: 'include',
    headers
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Failed to close support ticket');
  }
  return res.json();
} 