const API_URL = 'http://localhost:5000/api/offers';

export async function getAllOffers() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 