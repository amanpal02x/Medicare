import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

export async function getAllProducts(pharmacistId) {
  const token = localStorage.getItem('token');
  let url = joinUrl(API_BASE, '/products');
  if (pharmacistId) {
    url += `?pharmacist=${encodeURIComponent(pharmacistId)}`;
  }
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    headers
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// New function specifically for pharmacists to get their own products
export async function getPharmacistProducts() {
  const token = localStorage.getItem('token');
  const url = joinUrl(API_BASE, '/pharmacist/products');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch pharmacist products');
  return res.json();
}

export async function addProduct(data) {
  const token = localStorage.getItem('token');

  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('price', data.price);
  formData.append('stock', data.stock);
  formData.append('brand', data.brand || '');
  if (data.subcategory) {
    formData.append('subcategory', data.subcategory);
  }
  if (data.discountPercentage !== undefined) formData.append('discountPercentage', data.discountPercentage);
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
    
  }
  
  const url = joinUrl(API_BASE, '/pharmacist/products');
  
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Add product error response:', errorText); // Debug log
    throw new Error('Failed to add product');
  }
  return res.json();
}

export async function updateProduct(id, data) {
  const token = localStorage.getItem('token');
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('price', data.price);
  formData.append('stock', data.stock);
  formData.append('brand', data.brand || '');
  if (data.subcategory) {
    formData.append('subcategory', data.subcategory);
  }
  if (data.discountPercentage !== undefined) formData.append('discountPercentage', data.discountPercentage);
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
  }
  
  const res = await fetch(joinUrl(API_BASE, `/pharmacist/products/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, `/pharmacist/products/${id}`), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function updateProductDiscount(id, discountPercentage) {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, `/pharmacist/products/${id}/discount`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ discountPercentage })
  });
  if (!res.ok) throw new Error('Failed to update product discount');
  return res.json();
}

export async function getProductsByCategoryAndSubcategory(categoryId, subcategory) {
  const url = joinUrl(API_BASE, `/products?category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(subcategory)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products by category and subcategory');
  return res.json();
}

export async function getProductById(id) {
  const url = joinUrl(API_BASE, `/products/${id}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function getSimilarProducts(id, limit = 8) {
  const url = joinUrl(API_BASE, `/products/${id}/similar?limit=${limit}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch similar products');
  return res.json();
} 

export async function getProductsByPharmacist(pharmacistId, lat, lng) {
  if (!lat || !lng) throw new Error('User location required');
  const url = joinUrl(API_BASE, `/products/by-pharmacist/${pharmacistId}?lat=${lat}&lng=${lng}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products for pharmacist');
  return res.json();
} 