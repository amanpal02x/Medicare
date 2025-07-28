import config from '../utils/config';

const API_URL = `${config.API_BASE_URL}/brands`;

export async function getAllBrands() {
  const res = await fetch(`${API_URL}`);
  return res.json();
} 