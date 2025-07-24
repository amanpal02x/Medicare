// Get all prescriptions for the logged-in user
export async function getPrescriptions(token) {
  const res = await fetch('/api/prescriptions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch prescriptions');
  return res.json();
}

// Get processed prescriptions for reordering
export async function getProcessedPrescriptions(token) {
  const res = await fetch('/api/prescriptions/processed', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch processed prescriptions');
  return res.json();
}

// Upload a new prescription (file: File object)
export async function uploadPrescription(file, doctorName, prescriptionDate, token) {
  const formData = new FormData();
  formData.append('file', file);
  if (doctorName) formData.append('doctorName', doctorName);
  if (prescriptionDate) formData.append('prescriptionDate', prescriptionDate);
  
  const res = await fetch('/api/prescriptions/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload prescription');
  return res.json();
}

// Get a single prescription by ID
export async function getPrescription(id, token) {
  const res = await fetch(`/api/prescriptions/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch prescription');
  return res.json();
}

// Delete/cancel a prescription by ID
export async function deletePrescription(id, token) {
  const res = await fetch(`/api/prescriptions/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete prescription');
  return res.json();
}

// Pharmacist: Get all prescriptions
export async function getAllPrescriptions(token) {
  const res = await fetch('/api/prescriptions/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch all prescriptions');
  return res.json();
}

// Pharmacist: Process a prescription with medicine details
export async function processPrescription(id, medicines, pharmacistNote, totalAmount, token) {
  const res = await fetch(`/api/prescriptions/${id}/process`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ medicines, pharmacistNote, totalAmount })
  });
  if (!res.ok) throw new Error('Failed to process prescription');
  return res.json();
}

// Pharmacist: Approve a prescription
export async function approvePrescription(id, pharmacistNote, token) {
  const res = await fetch(`/api/prescriptions/${id}/approve`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pharmacistNote })
  });
  if (!res.ok) throw new Error('Failed to approve prescription');
  return res.json();
}

// Pharmacist: Reject a prescription
export async function rejectPrescription(id, pharmacistNote, token) {
  const res = await fetch(`/api/prescriptions/${id}/reject`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pharmacistNote })
  });
  if (!res.ok) throw new Error('Failed to reject prescription');
  return res.json();
} 