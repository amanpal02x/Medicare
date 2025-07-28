import config from '../utils/config';

const API_BASE_URL = config.API_BASE_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/delivery${endpoint}`;
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

// Registration
export const registerDeliveryBoy = async (userData) => {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Profile management
export const getDeliveryProfile = async () => {
  return apiCall('/profile');
};

export const createDeliveryProfile = async (profileData) => {
  return apiCall('/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
};

export const updateDeliveryProfile = async (profileData) => {
  return apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

// Document upload
export const uploadDocument = async (documentType, file) => {
  const formData = new FormData();
  formData.append('document', file);

  const url = `${API_BASE_URL}/delivery/documents/${documentType}`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Document upload failed');
  }

  return response.json();
};

// Order management
export const getDeliveryOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/orders?${queryString}`);
};

export const updateOrderStatus = async (orderId, status, notes = '') => {
  return apiCall(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });
};

export const getDeliveryOrderDetails = async (orderId) => {
  return apiCall(`/orders/${orderId}`);
};

// Location management
export const updateLocation = async (locationData) => {
  return apiCall('/location', {
    method: 'PUT',
    body: JSON.stringify(locationData),
  });
};

// Availability
export const toggleAvailability = async () => {
  return apiCall('/availability', {
    method: 'PUT',
  });
};

// Earnings
export const getEarnings = async (period = 'all') => {
  return apiCall(`/earnings?period=${period}`);
};

// Performance
export const getPerformance = async () => {
  return apiCall('/performance');
};

// Nearby orders
export const getNearbyOrders = async (lat, lng, maxDistance = 10) => {
  return apiCall(`/nearby-orders?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`);
};

// Real-time location tracking
export const startLocationTracking = (onLocationUpdate) => {
  if ('geolocation' in navigator) {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get address from coordinates (you might want to use a geocoding service)
          const address = await getAddressFromCoords(latitude, longitude);
          
          // Update location on server
          await updateLocation({
            lat: latitude,
            lng: longitude,
            address
          });

          // Call the callback with location data
          onLocationUpdate({ lat: latitude, lng: longitude, address });
        } catch (error) {
          console.error('Location tracking error:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return watchId;
  }
  
  return null;
};

export const stopLocationTracking = (watchId) => {
  if (watchId && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Helper function to get address from coordinates
const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
    
    return `${lat}, ${lng}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat}, ${lng}`;
  }
};

// Notification helpers
export const subscribeToOrderNotifications = (deliveryBoyId, onNotification) => {
  // This would typically connect to a WebSocket or use Server-Sent Events
  // For now, we'll use polling
  const interval = setInterval(async () => {
    try {
      const orders = await getDeliveryOrders({ status: 'assigned' });
      if (orders.orders && orders.orders.length > 0) {
        onNotification(orders.orders[0]);
      }
    } catch (error) {
      console.error('Notification polling error:', error);
    }
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
};

// Utility functions
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const formatEarnings = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDeliveryTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

// New functions for order acceptance and management
export const getProfile = async () => {
  return apiCall('/profile');
};

export const updateProfile = async (profileData) => {
  return apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const getOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/orders?${queryString}`);
};

export const getAvailableOrders = async () => {
  return apiCall('/available-orders');
};

export const acceptOrder = async (orderId) => {
  return apiCall(`/orders/${orderId}/accept`, {
    method: 'POST',
  });
};

export const rejectOrder = async (orderId, reason) => {
  return apiCall(`/orders/${orderId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const getOrderDetails = async (orderId) => {
  return apiCall(`/orders/${orderId}`);
};

export const updateOnlineStatus = async (isOnline) => {
  return apiCall('/online-status', {
    method: 'PUT',
    body: JSON.stringify({ isOnline }),
  });
};

export const createProfile = async (profileData) => {
  return apiCall('/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
};

export const register = async (registrationData) => {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(registrationData),
  });
}; 