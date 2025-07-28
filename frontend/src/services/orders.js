import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

function getToken() {
  return localStorage.getItem('token');
}

export async function placeOrder(orderData) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const res = await fetch(joinUrl(API_BASE, '/orders/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await res.text();
      throw new Error(`Server returned non-JSON response. Status: ${res.status}. Response: ${textResponse.substring(0, 200)}...`);
    }
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getUserOrders() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Fetching user orders...');
    
    const res = await fetch(joinUrl(API_BASE, '/orders/'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await res.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response. Status: ${res.status}. Response: ${textResponse.substring(0, 200)}...`);
    }
    
    const data = await res.json();
    console.log('Get user orders response:', data);
    
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    throw error;
  }
}

export async function getOrderDetails(orderId) {
  const res = await fetch(joinUrl(API_BASE, `/orders/${orderId}`), {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function getOrderById(orderId) {
  const res = await fetch(joinUrl(API_BASE, `/orders/${orderId}`), {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
} 

export const createOrderFromPrescription = async (prescriptionId, token) => {
  const res = await axios.post(
    joinUrl(API_BASE, `/orders/from-prescription/${prescriptionId}`),
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}; 