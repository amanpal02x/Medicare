import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');

// Helper function for API calls
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

// Get all users
export async function getAllUsers(params = {}) {
  // Always include role: 'user' unless overridden
  const query = { role: 'user', ...params };
  const queryString = new URLSearchParams(query).toString();
  return apiCall(`/all-users?${queryString}`);
}

// Get user by ID
export async function getUserById(id) {
  return apiCall(`/users/${id}`);
}

// Block/Unblock user
export async function blockUser(id, blocked) {
  return apiCall(`/users/${id}/block`, {
    method: 'PUT',
    body: JSON.stringify({ blocked }),
  });
}

// Get user statistics
export async function getUserStatistics() {
  return apiCall('/user-count');
}

// Export user data
export const exportUserData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/admin/users/export?${queryString}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export async function generateInviteToken(role) {
  return apiCall('/invite-token', {
    method: 'POST',
    body: JSON.stringify({ role })
  });
}

// Fetch all invite tokens (admin)
export async function getAllInviteTokens(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/invite-tokens${queryString ? `?${queryString}` : ''}`);
}

// Utility functions
export const formatUserRole = (role) => {
  return role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export const getUserRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'error';
    case 'pharmacist': return 'warning';
    case 'deliveryBoy': return 'info';
    case 'user': return 'success';
    default: return 'default';
  }
};

export const getUserStatusColor = (blocked) => {
  return blocked ? 'error' : 'success';
};

export const formatUserStatus = (blocked) => {
  return blocked ? 'Blocked' : 'Active';
}; 