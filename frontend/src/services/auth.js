const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

function getToken() {
  return localStorage.getItem('token');
}

export async function register(registrationData) {
  const { name, email, password, role, ...additionalData } = registrationData;
  // If registering as delivery boy, use the delivery-specific endpoint
  if (role === 'deliveryBoy') {
    return registerDeliveryBoy(registrationData);
  }
  const res = await fetch(joinUrl(API_BASE, 'auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, role, ...additionalData })
  });
  return res.json();
}

export async function registerDeliveryBoy(registrationData) {
  const { name, email, password, role, fullName, phone, vehicleType, vehicleNumber, gender, address, inviteToken } = registrationData;
  const res = await fetch(joinUrl(API_BASE, 'delivery/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fullName: fullName || name, 
      email, 
      password,
      phone: phone || '',
      vehicleType: vehicleType || 'bike',
      vehicleNumber: vehicleNumber || '',
      dateOfBirth: new Date().toISOString().split('T')[0], // Default value
      gender: gender || 'male',
      address: address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      inviteToken: inviteToken // Pass the invite token
    })
  });
  const data = await res.json();
  // If registration is successful, also update the user's name in the User collection
  if (data.token && data.user) {
    try {
      const updateRes = await fetch(joinUrl(API_BASE, 'auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({ name })
      });
      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        data.user.name = updatedUser.user.name;
      }
    } catch (error) {
      console.error('Failed to update user name:', error);
    }
  }
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(joinUrl(API_BASE, 'auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(joinUrl(API_BASE, 'auth/profile'), {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function updateProfile(profile) {
  let headers = {
    'Authorization': `Bearer ${getToken()}`
  };
  let body;
  // Check if profile is FormData (for photo upload) or regular object
  if (profile instanceof FormData) {
    body = profile;
    // Don't set Content-Type for FormData, let the browser set it with boundary
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(profile);
  }
  const res = await fetch(joinUrl(API_BASE, 'auth/profile'), {
    method: 'PUT',
    headers,
    body
  });
  return res.json();
} 

export async function getAddresses() {
  const res = await fetch(joinUrl(API_BASE, 'auth/addresses'), {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
}

export async function addAddress(address) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    const res = await fetch(joinUrl(API_BASE, 'auth/addresses'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(address)
    });
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await res.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response. Status: ${res.status}. Response: ${textResponse.substring(0, 200)}...`);
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error in addAddress:', error);
    throw error;
  }
}

export async function removeAddress(addressId) {
  const res = await fetch(joinUrl(API_BASE, 'auth/addresses', addressId), {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
} 

export async function verifyInviteToken(role, token) {
  try {
    const res = await fetch(joinUrl(API_BASE, `auth/verify-invite-token?role=${role}&token=${token}`));
    return await res.json();
  } catch (e) {
    return { valid: false, message: 'Failed to verify invite token.' };
  }
} 