const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin/payments';

export async function getAllPayments() {
  const res = await fetch(`${API_URL}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
} 