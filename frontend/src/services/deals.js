const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/deals';

export async function getActiveDeals() {
  const res = await fetch(`${API_URL}/active`);
  if (!res.ok) throw new Error('Failed to fetch active deals');
  return res.json();
}

export async function createDeal(data, token) {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create deal');
  return res.json();
}

export async function getAllDeals(token) {
  const res = await fetch(`${API_URL}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch all deals');
  return res.json();
}

export async function deleteDeal(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete deal');
  return res.json();
}

export async function updateDeal(id, data, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update deal');
  return res.json();
} 