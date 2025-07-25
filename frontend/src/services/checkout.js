const API_URL = process.env.REACT_APP_API_URL || 'https://medicare-v.vercel.app//api';

// Place a new order
export async function placeOrder(orderData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to place order');
  }

  return response.json();
}

// Validate address
export function validateAddress(address) {
  const errors = {};
  
  if (!address.trim()) {
    errors.address = 'Address is required';
  }
  
  return errors;
}

// Validate phone number
export function validatePhone(phone) {
  const errors = {};
  
  if (!phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }
  
  return errors;
}

// Validate pincode
export function validatePincode(pincode) {
  const errors = {};
  
  if (!pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(pincode)) {
    errors.pincode = 'Pincode must be 6 digits';
  }
  
  return errors;
}

// Validate card details
export function validateCardDetails(cardNumber, cardExpiry, cardCvv) {
  const errors = {};
  
  if (!cardNumber.trim()) {
    errors.cardNumber = 'Card number is required';
  } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Invalid card number';
  }
  
  if (!cardExpiry.trim()) {
    errors.cardExpiry = 'Expiry date is required';
  } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    errors.cardExpiry = 'Invalid expiry date format (MM/YY)';
  }
  
  if (!cardCvv.trim()) {
    errors.cardCvv = 'CVV is required';
  } else if (!/^\d{3,4}$/.test(cardCvv)) {
    errors.cardCvv = 'Invalid CVV';
  }
  
  return errors;
}

// Format card number with spaces
export function formatCardNumber(cardNumber) {
  return cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
}

// Calculate order totals
export function calculateOrderTotals(cartItems) {
  const subtotal = cartItems.reduce((total, item) => {
    if (!item.item) return total;
    const price = item.item.discountedPrice || item.item.price || 0;
    return total + (price * (item.quantity || 1));
  }, 0);
  
  const tax = subtotal * 0.175; // 17.5% tax
  const total = subtotal + tax;
  
  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  };
} 