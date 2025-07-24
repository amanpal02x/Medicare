const API_URL = process.env.REACT_APP_API_URL || '/api/support';

export async function getUserSupportTickets(token) {
  const res = await fetch(`${API_URL}`, {
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
  const res = await fetch(`${API_URL}/${id}/reply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to reply to support ticket');
  return res.json();
} 