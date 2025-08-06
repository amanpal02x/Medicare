import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

export async function getPharmacistProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, '/pharmacist/profile'), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updatePharmacistProfile(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, '/pharmacist/profile'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function updatePharmacistLocation(address) {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, '/pharmacist/location'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ address })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update location');
  }
  return res.json();
}

export async function getNearbyProductsAndMedicines(lat, lng, maxDistance = 25000) {
  const res = await fetch(joinUrl(API_BASE, `/pharmacist/nearby-products-medicines?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}`));
  if (!res.ok) throw new Error('Failed to fetch nearby products and medicines');
  return res.json();
}

// Set location manually (for testing)
export async function setLocationManually(lat, lng, online = false) {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, '/pharmacist/set-location-manually'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ lat, lng, online })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to set location');
  }
  return res.json();
} 