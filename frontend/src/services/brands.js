const API_URL = 'https://medicare-v.vercel.app//api/brands';

export async function getAllBrands() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 