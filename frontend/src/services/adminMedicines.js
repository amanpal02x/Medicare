import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');

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

export async function getAllMedicines(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/medicines?${queryString}`);
}

export async function addMedicine(medicine) {
  const res = await fetch(`${API_BASE}/admin/medicines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(medicine)
  });
  if (!res.ok) throw new Error('Failed to add medicine');
  return res.json();
}

export async function updateMedicine(id, medicine) {
  const res = await fetch(`${API_BASE}/admin/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(medicine)
  });
  if (!res.ok) throw new Error('Failed to update medicine');
  return res.json();
}

export async function deleteMedicine(id) {
  const res = await fetch(`${API_BASE}/admin/medicines/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete medicine');
  return res.json();
} 