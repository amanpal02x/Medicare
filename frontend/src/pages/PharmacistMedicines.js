import React, { useEffect, useState } from 'react';
import { getAllMedicines, addMedicine, updateMedicine } from '../services/medicines';
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge } from '@mui/material';

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 32,
  background: 'white',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
};
const thStyle = {
  background: '#f3f4f6',
  padding: 10,
  fontWeight: 700,
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'left',
};
const tdStyle = {
  padding: 10,
  borderBottom: '1px solid #e5e7eb',
  fontSize: 15,
};
const imgStyle = {
  width: 48,
  height: 48,
  objectFit: 'cover',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
};
const modalBackdrop = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle = {
  background: 'white', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.13)'
};
const inputStyle = { width: '100%', padding: 8, margin: '8px 0 16px 0', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15 };
const labelStyle = { fontWeight: 600, marginBottom: 2, display: 'block' };
const btnStyle = { padding: '8px 20px', borderRadius: 6, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginRight: 8 };

function MedicineFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || {});
  const [imageFile, setImageFile] = useState(null);
  useEffect(() => { setForm(initial || {}); setImageFile(null); }, [initial, open]);
  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  }
  function handleFile(e) { setImageFile(e.target.files[0]); }
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, image: imageFile });
  }
  if (!open) return null;
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{marginBottom:16}}>{initial? 'Update Medicine':'Add New Medicine'}</h2>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} name="name" value={form.name||''} onChange={handleChange} required />
          <label style={labelStyle}>Price</label>
          <input style={inputStyle} name="price" type="number" value={form.price||''} onChange={handleChange} required min={0} />
          <label style={labelStyle}>Stock</label>
          <input style={inputStyle} name="stock" type="number" value={form.stock||''} onChange={handleChange} required min={0} />
          <label style={labelStyle}>Expiry Date</label>
          <input style={inputStyle} name="expiryDate" type="date" value={form.expiryDate?form.expiryDate.slice(0,10):''} onChange={handleChange} required />
          <label style={labelStyle}>Discount %</label>
          <input style={inputStyle} name="discountPercentage" type="number" value={form.discountPercentage||0} onChange={handleChange} min={0} max={100} />
          <label style={labelStyle}>Image</label>
          <input style={inputStyle} name="image" type="file" accept="image/*" onChange={handleFile} />
          <div style={{marginTop:16}}>
            <button type="submit" style={{...btnStyle, background:'#6366f1', color:'white'}}>{initial?'Update':'Add'}</button>
            <button type="button" style={{...btnStyle, background:'#e5e7eb', color:'#222'}} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PharmacistMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const MEDICINES_PER_PAGE = 15;
  const { user } = useAuth();

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllMedicines();
      if (Array.isArray(data)) {
        setMedicines(data);
      } else {
        setError(data.message || 'Failed to load medicines');
        setMedicines([]);
      }
    } catch (e) {
      setError('Failed to load medicines');
      setMedicines([]);
    }
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleAddOrUpdate(data) {
    try {
      if (editMed) {
        await updateMedicine(editMed._id, data);
        setActionMsg('Medicine updated successfully!');
      } else {
        await addMedicine(data);
        setActionMsg('Medicine added successfully!');
      }
      setModalOpen(false);
      setEditMed(null);
      await refresh();
      setTimeout(()=>setActionMsg(''), 2000);
    } catch (e) {
      setActionMsg(e.message || 'Action failed');
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(medicines.length / MEDICINES_PER_PAGE);
  const paginatedMedicines = medicines.slice((currentPage - 1) * MEDICINES_PER_PAGE, currentPage * MEDICINES_PER_PAGE);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Add top bar with greeting, profile, and notification bell
  return (
    <div style={{ maxWidth: 1300, margin: '40px auto', padding: '0 16px' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} mt={2}>
        <div style={{ width: 48 }} /> {/* Empty left for spacing */}
        <Typography variant="h5" fontWeight={600} color="primary" align="center">
          Hello{user && user.name ? `, ${user.name}` : ''}!
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Notifications">
            <IconButton color="primary">
              <Badge color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.name || 'Profile'}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Tooltip>
        </Box>
      </Box>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#6366f1' }}>All Medicines</h1>
      <p style={{ fontSize: 17, color: '#555', marginBottom: 24 }}>View and manage all medicines in your inventory</p>
      <button style={{...btnStyle, background:'#6366f1', color:'white', marginBottom:16}} onClick={()=>{setEditMed(null);setModalOpen(true);}}>+ Add New Medicine</button>
      {actionMsg && <div style={{marginBottom:12, color:'#22c55e', fontWeight:600}}>{actionMsg}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>Loading medicines...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#e53935' }}>{error}</div>
      ) : medicines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>No medicines available.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Expiry Date</th>
                <th style={thStyle}>Discount %</th>
                <th style={thStyle}>Discounted Price</th>
                <th style={thStyle}>Avg. Rating</th>
                <th style={thStyle}>Total Ratings</th>
                <th style={thStyle}>Created At</th>
                <th style={thStyle}>Updated At</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMedicines.map(med => (
                <tr key={med._id}>
                  <td style={tdStyle}>{med.image ? <img src={med.image} alt={med.name} style={imgStyle} /> : '-'}</td>
                  <td style={tdStyle}>{med.name}</td>
                  <td style={tdStyle}>₹{med.price}</td>
                  <td style={tdStyle}>{med.stock}</td>
                  <td style={tdStyle}>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '-'}</td>
                  <td style={tdStyle}>{med.discountPercentage || 0}%</td>
                  <td style={tdStyle}>₹{med.discountedPrice || (med.price * (1 - (med.discountPercentage || 0) / 100)).toFixed(2)}</td>
                  <td style={tdStyle}>{med.averageRating || 0}</td>
                  <td style={tdStyle}>{med.totalRatings || 0}</td>
                  <td style={tdStyle}>{med.createdAt ? new Date(med.createdAt).toLocaleString() : '-'}</td>
                  <td style={tdStyle}>{med.updatedAt ? new Date(med.updatedAt).toLocaleString() : '-'}</td>
                  <td style={tdStyle}><button style={{...btnStyle, background:'#fbbf24', color:'#222'}} onClick={()=>{setEditMed(med);setModalOpen(true);}}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 8 }}>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{...btnStyle, background:'#e5e7eb', color:'#222'}}>Prev</button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  style={{
                    ...btnStyle,
                    background: currentPage === idx + 1 ? '#6366f1' : '#e5e7eb',
                    color: currentPage === idx + 1 ? 'white' : '#222',
                    minWidth: 36
                  }}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{...btnStyle, background:'#e5e7eb', color:'#222'}}>Next</button>
            </div>
          )}
        </div>
      )}
      <MedicineFormModal open={modalOpen} onClose={()=>{setModalOpen(false);setEditMed(null);}} onSubmit={handleAddOrUpdate} initial={editMed} />
    </div>
  );
};

export default PharmacistMedicines;
