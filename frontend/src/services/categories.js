const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/categories';

export async function getAllCategories() {
  const res = await fetch(`${API_URL}`);
  return res.json();
}

export async function addCategory(category) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  return res.json();
}

export async function updateCategory(id, category) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  return res.json();
}

export async function deleteCategory(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
} 