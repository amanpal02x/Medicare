const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/';

function getToken() {
  return localStorage.getItem('token');
}

export async function getInvoices() {
  const res = await fetch(`${API_BASE}pharmacist/invoices`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function createInvoice(data) {
  const res = await fetch(`${API_BASE}pharmacist/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

export async function updateInvoice(id, data) {
  const res = await fetch(`${API_BASE}pharmacist/invoices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
}

export async function deleteInvoice(id) {
  const res = await fetch(`${API_BASE}pharmacist/invoices/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}pharmacist/analytics`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
} 