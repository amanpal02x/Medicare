const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/admin/support';

export async function getAllSupportTickets() {
  const res = await fetch(`${API_URL}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch support tickets');
  return res.json();
}

export async function replySupportTicket(id, message, files, token) {
  const formData = new FormData();
  formData.append('message', message);
  if (files && files.length) {
    for (let f of files) formData.append('files', f);
  }
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/${id}/reply`, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: formData
  });
  if (!res.ok) throw new Error('Failed to reply to support ticket');
  return res.json();
}

export async function closeSupportTicket(id) {
  const res = await fetch(`${API_URL}/${id}/close`, { method: 'PUT', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to close support ticket');
  return res.json();
} 