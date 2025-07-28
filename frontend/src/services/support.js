const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/';

// Example usage:
// fetch(`${API_BASE}support/your-endpoint`, ...)

export async function getUserSupportTickets(token) {
  const res = await fetch(`${API_BASE}support/tickets`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch your support tickets');
  return res.json();
}

export async function replyUserSupportTicket(id, message, files, token) {
  const formData = new FormData();
  formData.append('message', message);
  if (files && files.length) {
    for (let f of files) formData.append('files', f);
  }
  const res = await fetch(`${API_BASE}support/tickets/${id}/reply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to reply to support ticket');
  return res.json();
} 