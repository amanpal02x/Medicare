const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin/analytics';

export async function getAnalytics() {
  const res = await fetch(`${API_URL}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
} 