import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');

// Enhanced error handling
function handleApiError(response, operation) {
  if (!response.ok) {
    console.error(`${operation} failed:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    } else if (response.status === 403) {
      throw new Error('Access denied. You may not have permission to perform this action.');
    } else if (response.status === 404) {
      throw new Error('Resource not found. The requested endpoint may not exist.');
    } else {
      throw new Error(`${operation} failed with status ${response.status}`);
    }
  }
}

export const getProfile = async () => {
  const res = await fetch(`${API_BASE}/delivery/profile`, { 
    headers: config.getAuthHeaders() 
  });
  handleApiError(res, 'Fetch delivery profile');
  return res.json();
};

export const getOrders = async (status = 'active') => {
  const res = await fetch(`${API_BASE}/delivery/orders?status=${status}`, { 
    headers: config.getAuthHeaders() 
  });
  handleApiError(res, 'Fetch delivery orders');
  return res.json();
};

export const getAvailableOrders = async () => {
  const res = await fetch(`${API_BASE}/delivery/available-orders`, { 
    headers: config.getAuthHeaders() 
  });
  handleApiError(res, 'Fetch available orders');
  return res.json();
};

export const getEarnings = async (period = 'today') => {
  const res = await fetch(`${API_BASE}/delivery/earnings?period=${period}`, { 
    headers: config.getAuthHeaders() 
  });
  handleApiError(res, 'Fetch earnings');
  return res.json();
};

export const getPerformance = async () => {
  const res = await fetch(`${API_BASE}/delivery/performance`, { 
    headers: config.getAuthHeaders() 
  });
  handleApiError(res, 'Fetch performance');
  return res.json();
};

export const updateOnlineStatus = async (isOnline) => {
  const res = await fetch(`${API_BASE}/delivery/online-status`, { 
    method: 'PUT', 
    headers: config.getHeaders(), 
    body: JSON.stringify({ isOnline }) 
  });
  handleApiError(res, 'Update online status');
  return res.json();
};

export const updateProfile = async (profileData) => {
  const res = await fetch(`${API_BASE}/delivery/profile`, { 
    method: 'PUT', 
    headers: config.getHeaders(), 
    body: JSON.stringify(profileData) 
  });
  handleApiError(res, 'Update profile');
  return res.json();
}; 