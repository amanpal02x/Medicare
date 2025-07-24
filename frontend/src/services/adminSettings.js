const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin/settings';

export async function getSettings() {
  const res = await fetch(`${API_URL}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${API_URL}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
} 