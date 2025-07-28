const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/';

export async function getAllSales() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}pharmacist/sales`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function addSale(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}pharmacist/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add sale');
  return res.json();
}

export async function deleteSale(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}pharmacist/sales/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete sale');
  return res.json();
} 