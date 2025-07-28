const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('token');
}

// Get all pharmacist sales data
export async function getPharmacistSales() {
  const res = await fetch(`${API_BASE}/pharmacist-sales`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist sales');
  return res.json();
}

// Get pharmacist customers data
export async function getPharmacistCustomers() {
  const res = await fetch(`${API_BASE}/pharmacist-customers`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist customers');
  return res.json();
}

// Get pharmacist suppliers data
export async function getPharmacistSuppliers() {
  const res = await fetch(`${API_BASE}/pharmacist-suppliers`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist suppliers');
  return res.json();
}

// Get pharmacist analytics
export async function getPharmacistAnalytics() {
  const res = await fetch(`${API_BASE}/pharmacist-analytics`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist analytics');
  return res.json();
} 