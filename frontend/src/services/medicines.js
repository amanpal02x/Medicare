const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

export async function searchMedicines(q) {
  const res = await fetch(`${API_BASE}medicines/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

export async function getAllMedicines() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}medicines`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// New function specifically for pharmacists to get their own medicines
export async function getPharmacistMedicines() {
  const token = localStorage.getItem('token');
  const url = `${API_BASE}pharmacist/medicines`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist medicines');
  return res.json();
}

export async function addMedicine(data) {
  const token = localStorage.getItem('token');
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('stock', data.stock);
  formData.append('expiryDate', data.expiryDate);
  if (data.category) formData.append('category', data.category);
  if (data.subcategory) formData.append('subcategory', data.subcategory);
  if (data.discountPercentage !== undefined) formData.append('discountPercentage', data.discountPercentage);
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
  }
  
  const res = await fetch(`${API_BASE}pharmacist/medicines`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add medicine');
  }
  return res.json();
}

export async function updateMedicine(id, data) {
  const token = localStorage.getItem('token');
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('stock', data.stock);
  formData.append('expiryDate', data.expiryDate);
  if (data.category) formData.append('category', data.category);
  if (data.subcategory) formData.append('subcategory', data.subcategory);
  if (data.discountPercentage !== undefined) formData.append('discountPercentage', data.discountPercentage);
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
  }
  
  const res = await fetch(`${API_BASE}pharmacist/medicines/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update medicine');
  }
  return res.json();
}

export async function deleteMedicine(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}pharmacist/medicines/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete medicine');
  return res.json();
}

export async function updateDiscount(id, discountPercentage) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}pharmacist/medicines/${id}/discount`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ discountPercentage })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update discount');
  }
  return res.json();
} 

export async function getMedicineById(id) {
  const url = `${API_BASE}medicines/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch medicine details');
  return res.json();
}

export async function getSimilarMedicines(id, limit = 8) {
  const url = `${API_BASE}medicines/${id}/similar?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch similar medicines');
  return res.json();
} 

export async function getMedicinesByPharmacist(pharmacistId, lat, lng) {
  if (!lat || !lng) throw new Error('User location required');
  const url = `${API_BASE}medicines/by-pharmacist/${pharmacistId}?lat=${lat}&lng=${lng}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch medicines for pharmacist');
  return res.json();
} 

export async function getFrequentlySearchedMedicines() {
  const res = await fetch(`${API_BASE}medicines/frequently-searched`);
  if (!res.ok) throw new Error('Failed to fetch frequently searched medicines');
  return res.json();
} 