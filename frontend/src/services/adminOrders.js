const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/admin';

export async function getAllOrders(params = {}) {
  console.log('getAllOrders called with params:', params);
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  const url = `${API_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  if (!API_URL) console.error('API_URL is undefined!');
  console.log('Fetching URL:', url);
  const token = localStorage.getItem('token');
  const res = await fetch(url, { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
  console.log('Fetch response status:', res.status);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function getOrderById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders/${id}`, { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch order details');
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
} 