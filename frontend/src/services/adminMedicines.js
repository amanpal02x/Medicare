const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api/admin/medicines';

export async function getAllMedicines(pharmacistId) {
  let url = `${API_URL}`;
  if (pharmacistId) {
    const param = encodeURIComponent(pharmacistId);
    url += `?pharmacist=${param}`;
  }
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

export async function addMedicine(medicine) {
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(medicine)
  });
  if (!res.ok) throw new Error('Failed to add medicine');
  return res.json();
}

export async function updateMedicine(id, medicine) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(medicine)
  });
  if (!res.ok) throw new Error('Failed to update medicine');
  return res.json();
}

export async function deleteMedicine(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete medicine');
  return res.json();
} 