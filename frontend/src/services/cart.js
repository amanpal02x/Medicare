const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api/cart';

function getToken() {
  return localStorage.getItem('token');
}

export async function getCart() {
  const res = await fetch(`${API_URL}/`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(itemId, itemType = 'medicine', quantity = 1) {

  const res = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ itemId, itemType, quantity })
  });
  
  
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Add to cart error response:', errorText); // Debug log
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

  const res = await fetch(`${API_URL}/remove`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ itemId, itemType })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Remove cart error response:', errorText); // Debug log
    throw new Error('Failed to remove from cart');
  }
  return res.json();
}

export async function clearCart() {

  const res = await fetch(`${API_URL}/clear`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Clear cart error response:', errorText); // Debug log
    throw new Error('Failed to clear cart');
  }
  return res.json();
}

export async function updateCartItem(itemId, itemType = 'medicine', quantity) {
  const res = await fetch(`${API_URL}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
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
  const res = await fetch(`${API_URL}/merge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ items })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Merge cart error response:', errorText);
    throw new Error('Failed to merge cart');
  }
  return res.json();
} 