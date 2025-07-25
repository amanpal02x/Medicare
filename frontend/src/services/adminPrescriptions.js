const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api/admin/prescriptions';

export async function getAllPrescriptions() {
  const res = await fetch(`${API_URL}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch prescriptions');
  return res.json();
}

export async function approvePrescription(id) {
  const res = await fetch(`${API_URL}/${id}/approve`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to approve prescription');
  return res.json();
}

export async function rejectPrescription(id) {
  const res = await fetch(`${API_URL}/${id}/reject`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to reject prescription');
  return res.json();
} 