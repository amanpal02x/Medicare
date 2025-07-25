const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/admin';

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

export async function getAllPrescriptions(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/prescriptions?${queryString}`);
}

export async function approvePrescription(id) {
  const res = await fetch(`${API_URL}/${id}/approve`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to approve prescription');
  return res.json();
}

export async function rejectPrescription(id) {
  const res = await fetch(`${API_URL}/${id}/reject`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to reject prescription');
  return res.json();
} 