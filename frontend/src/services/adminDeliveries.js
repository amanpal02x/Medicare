const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/admin${endpoint}`;
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

// Get all delivery boys
export const getAllDeliveryBoys = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/delivery-boys?${queryString}`);
};

// Get delivery boy by ID
export const getDeliveryBoyById = async (id) => {
  return apiCall(`/delivery-boys/${id}`);
};

// Update delivery boy status
export const updateDeliveryBoyStatus = async (id, status) => {
  return apiCall(`/delivery-boys/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Approve delivery boy
export const approveDeliveryBoy = async (id) => {
  return apiCall(`/delivery-boys/${id}/approve`, {
    method: 'PUT',
  });
};

// Suspend delivery boy
export const suspendDeliveryBoy = async (id, reason) => {
  return apiCall(`/delivery-boys/${id}/suspend`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
};

// Get delivery boy performance
export const getDeliveryBoyPerformance = async (id) => {
  return apiCall(`/delivery-boys/${id}/performance`);
};

// Get delivery boy earnings
export const getDeliveryBoyEarnings = async (id, period = 'all') => {
  return apiCall(`/delivery-boys/${id}/earnings?period=${period}`);
};

// Get delivery boy orders
export const getDeliveryBoyOrders = async (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/delivery-boys/${id}/orders?${queryString}`);
};

// Assign delivery boy to order
export const assignDeliveryBoyToOrder = async (orderId, deliveryBoyId) => {
  return apiCall(`/orders/${orderId}/assign-delivery`, {
    method: 'PUT',
    body: JSON.stringify({ deliveryBoyId }),
  });
};

// Get unassigned orders
export const getUnassignedOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/orders/unassigned?${queryString}`);
};

// Get delivery statistics
export const getDeliveryStatistics = async () => {
  return apiCall('/delivery-statistics');
};

// Get delivery performance overview
export const getDeliveryPerformanceOverview = async (period = 'month') => {
  return apiCall(`/delivery-performance?period=${period}`);
};

// Get nearby delivery boys
export const getNearbyDeliveryBoys = async (lat, lng, maxDistance = 10) => {
  return apiCall(`/delivery-boys/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`);
};

// Auto assign delivery boy to order
export const autoAssignDeliveryBoy = async (orderId) => {
  return apiCall(`/orders/${orderId}/auto-assign`, {
    method: 'PUT',
  });
};

// Get delivery boy location history
export const getDeliveryBoyLocationHistory = async (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/delivery-boys/${id}/location-history?${queryString}`);
};

// Update delivery boy work area
export const updateDeliveryBoyWorkArea = async (id, workArea) => {
  return apiCall(`/delivery-boys/${id}/work-area`, {
    method: 'PUT',
    body: JSON.stringify({ workArea }),
  });
};

// Get delivery boy documents
export const getDeliveryBoyDocuments = async (id) => {
  return apiCall(`/delivery-boys/${id}/documents`);
};

// Verify delivery boy document
export const verifyDeliveryBoyDocument = async (id, documentType, verified) => {
  return apiCall(`/delivery-boys/${id}/documents/${documentType}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ verified }),
  });
};

// Get delivery boy ratings and reviews
export const getDeliveryBoyReviews = async (id, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/delivery-boys/${id}/reviews?${queryString}`);
};

// Send notification to delivery boy
export const sendNotificationToDeliveryBoy = async (id, notification) => {
  return apiCall(`/delivery-boys/${id}/notifications`, {
    method: 'POST',
    body: JSON.stringify(notification),
  });
};

// Get delivery boy schedule
export const getDeliveryBoySchedule = async (id, date) => {
  return apiCall(`/delivery-boys/${id}/schedule?date=${date}`);
};

// Update delivery boy schedule
export const updateDeliveryBoySchedule = async (id, schedule) => {
  return apiCall(`/delivery-boys/${id}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  });
};

// Get delivery boy analytics
export const getDeliveryBoyAnalytics = async (id, period = 'month') => {
  return apiCall(`/delivery-boys/${id}/analytics?period=${period}`);
};

// Bulk operations
export const bulkUpdateDeliveryBoyStatus = async (ids, status) => {
  return apiCall('/delivery-boys/bulk-status', {
    method: 'PUT',
    body: JSON.stringify({ ids, status }),
  });
};

export const bulkAssignDeliveryBoys = async (assignments) => {
  return apiCall('/orders/bulk-assign', {
    method: 'PUT',
    body: JSON.stringify({ assignments }),
  });
};

// Export functions
export const exportDeliveryBoyData = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/admin/delivery-boys/export?${queryString}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `delivery-boys-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Utility functions
export const formatDeliveryBoyStatus = (status) => {
  return status.replace('_', ' ').toUpperCase();
};

export const getDeliveryBoyStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'error';
    case 'suspended': return 'warning';
    case 'pending_approval': return 'info';
    default: return 'default';
  }
};

export const calculateDeliveryBoyEfficiency = (performance) => {
  if (!performance.totalDeliveries) return 0;
  return (performance.successfulDeliveries / performance.totalDeliveries * 100).toFixed(1);
};

export const getDeliveryBoyRatingColor = (rating) => {
  if (rating >= 4.5) return 'success';
  if (rating >= 4.0) return 'warning';
  return 'error';
};

// Get orders ready for delivery assignment
export const getOrdersForAssignment = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/orders/for-assignment?${queryString}`);
};

// Get available delivery boys for assignment
export const getAvailableDeliveryBoys = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/delivery-boys/available?${queryString}`);
};

// Auto-assign orders to available delivery boys
export const autoAssignOrders = async (orderIds) => {
  return apiCall('/orders/auto-assign', {
    method: 'POST',
    body: JSON.stringify({ orderIds }),
  });
};

// Get delivery assignment statistics
export const getDeliveryAssignmentStats = async () => {
  return apiCall('/delivery-assignment-stats');
}; 

// Fix preparing orders utility
export const fixPreparingOrders = async () => {
  return apiCall('/fix-preparing-orders', {
    method: 'POST',
  });
};

// Get order assignment statistics
export const getOrderAssignmentStats = async () => {
  return apiCall('/order-assignment-stats');
};

// Fix order delivery assignment issues
export const fixOrderAssignment = async () => {
  return apiCall('/fix-order-assignment', {
    method: 'POST'
  });
}; 

// Delete delivery boy by ID
export const deleteDeliveryBoy = async (id) => {
  return apiCall(`/delivery-boys/${id}`, {
    method: 'DELETE',
  });
};

// Get delivery boy statistics
export const getDeliveryBoyStatistics = async () => {
  return apiCall('/delivery-boy-statistics');
}; 