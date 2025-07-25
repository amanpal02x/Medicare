const API_URL = 'http://localhost:5000/api/brands';

export async function getAllBrands() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 