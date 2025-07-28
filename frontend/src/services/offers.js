import config from '../utils/config';

const API_URL = `${config.API_BASE_URL}/offers`;

export async function getAllOffers() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 