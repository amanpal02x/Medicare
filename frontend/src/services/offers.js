const API_URL = 'https://medicare-v.vercel.app//api/offers';

export async function getAllOffers() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 