const API_URL = 'https://medicare-ydw4.onrender.com/api/brands';

export async function getAllBrands() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 