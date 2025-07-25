const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api/pharmacist/sales';

export async function getAllSales() {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function addSale(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add sale');
  return res.json();
} 