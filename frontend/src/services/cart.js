const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

function getToken() {
  return localStorage.getItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

export async function getCart() {
  const headers = isLoggedIn() ? { 'Authorization': `Bearer ${getToken()}` } : {};
  const res = await fetch(joinUrl(API_BASE, '/cart'), { headers });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(itemId, itemType = 'medicine', quantity = 1) {
  const headers = isLoggedIn() ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  } : { 'Content-Type': 'application/json' };
  const res = await fetch(joinUrl(API_BASE, '/cart/add'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ itemId, itemType, quantity })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Add to cart error response:', errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.error || 'Failed to add to cart');
    } catch (e) {
      throw new Error(errorText || 'Failed to add to cart');
    }
  }
  return res.json();
}

export async function removeFromCart(itemId, itemType = 'medicine') {
  const headers = isLoggedIn() ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  } : { 'Content-Type': 'application/json' };
  const res = await fetch(joinUrl(API_BASE, '/cart/remove'), {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ itemId, itemType })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Remove cart error response:', errorText);
    throw new Error('Failed to remove from cart');
  }
  return res.json();
}

export async function clearCart() {
  const headers = isLoggedIn() ? { 'Authorization': `Bearer ${getToken()}` } : {};
  const res = await fetch(joinUrl(API_BASE, '/cart/clear'), {
    method: 'DELETE',
    headers
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Clear cart error response:', errorText);
    throw new Error('Failed to clear cart');
  }
  return res.json();
}

export async function updateCartItem(itemId, itemType = 'medicine', quantity) {
  const headers = isLoggedIn() ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  } : { 'Content-Type': 'application/json' };
  const res = await fetch(joinUrl(API_BASE, '/cart/update'), {
    method: 'PUT',
    headers,
    body: JSON.stringify({ itemId, itemType, quantity })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Update cart error response:', errorText);
    throw new Error('Failed to update cart item');
  }
  return res.json();
}

export async function mergeCart(items) {
  const headers = isLoggedIn() ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  } : { 'Content-Type': 'application/json' };
  const res = await fetch(joinUrl(API_BASE, '/cart/merge'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ items })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Merge cart error response:', errorText);
    throw new Error('Failed to merge cart');
  }
  return res.json();
} 