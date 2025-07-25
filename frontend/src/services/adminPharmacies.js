const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/admin';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

// Get all pharmacies/pharmacists
export async function getAllPharmacies(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/pharmacists?${queryString}`);
}

// Get pharmacist by ID
export async function getPharmacistById(id) {
  return apiCall(`/pharmacists/${id}`);
}

// Update pharmacist status
export async function updatePharmacistStatus(id, status, reason = '') {
  return apiCall(`/pharmacists/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason }),
  });
}

// Get pharmacist statistics
export async function getPharmacistStatistics() {
  return apiCall('/pharmacist-statistics');
}

// Approve pharmacist
export async function approvePharmacist(id) {
  return apiCall(`/pharmacists/${id}/approve`, {
    method: 'PUT',
  });
}

// Reject pharmacist
export async function rejectPharmacist(id) {
  return apiCall(`/pharmacists/${id}/reject`, {
    method: 'PUT',
  });
}

// Get pending pharmacists
export async function getPendingPharmacists() {
  return apiCall('/pending-pharmacists');
}

// Get approved pharmacists
export async function getApprovedPharmacists() {
  return apiCall('/all-pharmacists');
}

// Force delete pharmacist (admin only)
export async function forceDeletePharmacist(id) {
  return apiCall(`/pharmacists/${id}/force`, {
    method: 'DELETE',
  });
}

// Export pharmacist data
export const exportPharmacistData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/pharmacists/export?${queryString}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pharmacists-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Utility functions
export const formatPharmacistStatus = (status) => {
  return status.replace('_', ' ').toUpperCase();
};

export const getPharmacistStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

export const getPharmacistVerificationColor = (isVerified) => {
  return isVerified ? 'success' : 'warning';
}; 