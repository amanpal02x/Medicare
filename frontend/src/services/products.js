const API_URL = 'https://medicare-v.vercel.app//api/products';

export async function getAllProducts(pharmacistId) {
  const token = localStorage.getItem('token');
  let url = API_URL;
  if (pharmacistId) {
    url += `?pharmacist=${encodeURIComponent(pharmacistId)}`;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch products');
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
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
    
  }
  
  const url = `${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/pharmacist/products`;
  
  
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
  
  // Add image if provided
  if (data.image) {
    formData.append('image', data.image);
  }
  
  const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/pharmacist/products/${id}`, {
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
  const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/pharmacist/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function updateProductDiscount(id, discountPercentage) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/${id}/discount`, {
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
  const url = `${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/products?category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(subcategory)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products by category and subcategory');
  return res.json();
}

export async function getProductById(id) {
  const url = `${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/products/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
} 

export async function getProductsByPharmacist(pharmacistId, lat, lng) {
  if (!lat || !lng) throw new Error('User location required');
  const url = `${process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api'}/products/by-pharmacist/${pharmacistId}?lat=${lat}&lng=${lng}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products for pharmacist');
  return res.json();
} 