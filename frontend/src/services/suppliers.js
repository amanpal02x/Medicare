const API = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api/pharmacist';

function getToken() {
  return localStorage.getItem('token');
}

export async function getSuppliers() {
  const res = await fetch(`${API}/suppliers`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function createSupplier(data) {
  const res = await fetch(`${API}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create supplier');
  return res.json();
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${API}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update supplier');
  return res.json();
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API}/suppliers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to delete supplier');
  return res.json();
} 