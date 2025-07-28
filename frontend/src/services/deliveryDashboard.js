import config from '../utils/config';
import { fetchWithRetry, handleApiError } from '../utils/apiUtils';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');

export const getProfile = async () => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/profile`, { 
    headers: config.getAuthHeaders() 
  });
  await handleApiError(res, 'Fetch delivery profile');
  return res.json();
};

export const getOrders = async (status = 'active') => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/orders?status=${status}`, { 
    headers: config.getAuthHeaders() 
  });
  await handleApiError(res, 'Fetch delivery orders');
  return res.json();
};

export const getAvailableOrders = async () => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/available-orders`, { 
    headers: config.getAuthHeaders() 
  });
  await handleApiError(res, 'Fetch available orders');
  return res.json();
};

export const getEarnings = async (period = 'today') => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/earnings?period=${period}`, { 
    headers: config.getAuthHeaders() 
  });
  await handleApiError(res, 'Fetch earnings');
  return res.json();
};

export const getPerformance = async () => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/performance`, { 
    headers: config.getAuthHeaders() 
  });
  await handleApiError(res, 'Fetch performance');
  return res.json();
};

export const updateOnlineStatus = async (isOnline) => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/online-status`, { 
    method: 'PUT', 
    headers: config.getHeaders(), 
    body: JSON.stringify({ isOnline }) 
  });
  await handleApiError(res, 'Update online status');
  return res.json();
};

export const updateProfile = async (profileData) => {
  const res = await fetchWithRetry(`${API_BASE}/delivery/profile`, { 
    method: 'PUT', 
    headers: config.getHeaders(), 
    body: JSON.stringify(profileData) 
  });
  await handleApiError(res, 'Update profile');
  return res.json();
}; 