const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

// Example usage:
// fetch(`${API_BASE}pharmacist/orders`, ...)

// Get assigned orders
export async function getAssignedOrders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(joinUrl(API_BASE, '/pharmacist/orders'), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch orders');
  }

  return response.json();
}

// Get order details
export async function getOrderDetails(orderId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(joinUrl(API_BASE, `/pharmacist/orders/${orderId}`), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order details');
  }

  return response.json();
}

// Update order status
export async function updateOrderStatus(orderId, status, description = '') {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(joinUrl(API_BASE, `/pharmacist/orders/${orderId}/status`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order status');
  }

  return response.json();
}

// Get notifications
export async function getNotifications() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(joinUrl(API_BASE, '/pharmacist/notifications'), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notifications');
  }

  return response.json();
}

// Mark notification as read
export async function markNotificationRead(notificationId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(joinUrl(API_BASE, `/pharmacist/notifications/${notificationId}/read`), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notification as read');
  }

  return response.json();
}

// Assign notification to pharmacist
export async function assignNotification(notificationId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}pharmacist/notifications/${notificationId}/assign`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign notification');
  }

  return response.json();
}

// Get order statistics
export async function getOrderStats() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}pharmacist/orders/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order statistics');
  }

  return response.json();
}

// Claim an unassigned order
export async function claimOrder(orderId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}pharmacist/orders/${orderId}/claim`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to claim order');
  }

  return response.json();
} 