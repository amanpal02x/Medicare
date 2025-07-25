const API_URL = 'https://medicare-ydw4.onrender.com/api/offers';

export async function getAllOffers() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 