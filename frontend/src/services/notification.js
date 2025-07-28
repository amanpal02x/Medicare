const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

export async function getNotifications(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications'), {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationsRead(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications/read'), {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to mark notifications as read');
  return res.json();
}

export async function markNotificationRead(notificationId, token) {
  const res = await fetch(joinUrl(API_BASE, `/notifications/${notificationId}/read`), {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function clearSeenNotifications(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications/clear-seen'), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to clear seen notifications');
  return res.json();
}

export async function getNotificationCount(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications/count'), {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to get notification count');
  return res.json();
}

export async function testNotification(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications/test'), {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to send test notification');
  return res.json();
}

export async function clearAllNotifications(token) {
  const res = await fetch(joinUrl(API_BASE, '/notifications/clear-all'), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to clear all notifications');
  return res.json();
} 