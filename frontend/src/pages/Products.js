import React, { useEffect, useState } from 'react';
import { getAllProducts, getPharmacistProducts, addProduct, updateProduct, getProductsByPharmacist, deleteProduct } from '../services/products';
import { getAllCategories, addCategory, updateCategory } from '../services/categories';
import { useAuth } from '../context/AuthContext';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge } from '@mui/material';
import { getNearbyProductsAndMedicines } from '../services/pharmacist';

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

function ProductFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || {});
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catMsg, setCatMsg] = useState('');
  const [showAddSubcat, setShowAddSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [subcatMsg, setSubcatMsg] = useState('');
  useEffect(() => { setForm(initial || {}); setImageFile(null); }, [initial, open]);
  useEffect(() => { if (open) getAllCategories().then(setCategories); }, [open]);
  useEffect(() => {
    // If editing, and the category is set, but subcategory is not in the list, add it
    if (
      form.category &&
      form.subcategory &&
      categories.length > 0
    ) {
      const selectedCategory = categories.find(cat => cat._id === form.category);
      if (
        selectedCategory &&
        selectedCategory.subcategories &&
        !selectedCategory.subcategories.includes(form.subcategory)
      ) {
        selectedCategory.subcategories = [
          ...selectedCategory.subcategories,
          form.subcategory
        ];
        setCategories([...categories]);
      }
    }
  }, [categories, form.category, form.subcategory]);
  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  }
  function handleFile(e) { setImageFile(e.target.files[0]); }
  function handleSubmit(e) {
    e.preventDefault();
    console.log('Submitting product form:', form); // Debug log
    onSubmit({ ...form, image: imageFile });
  }
  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const cat = await addCategory({ name: newCatName });
      setCategories(cats => [...cats, cat]);
      setForm(f => ({ ...f, category: cat._id }));
      setCatMsg('Category added!');
      setTimeout(()=>setCatMsg(''), 1500);
      setShowAddCat(false);
      setNewCatName('');
    } catch (err) {
      setCatMsg('Failed to add category');
    }
  }
  async function handleAddSubcategory(e) {
    e.preventDefault();
    if (!newSubcatName.trim() || !form.category) return;
    try {
      const cat = categories.find(c => c._id === form.category);
      if (!cat) return;
      const updatedSubcats = Array.isArray(cat.subcategories) ? [...cat.subcategories, newSubcatName] : [newSubcatName];
      await updateCategory(cat._id, { ...cat, subcategories: updatedSubcats });
      const updatedCats = await getAllCategories();
      setCategories(updatedCats);
      setForm(f => ({ ...f, subcategory: newSubcatName }));
      setSubcatMsg('Subcategory added!');
      setTimeout(()=>setSubcatMsg(''), 1500);
      setShowAddSubcat(false);
      setNewSubcatName('');
    } catch (err) {
      setSubcatMsg('Failed to add subcategory');
    }
  }
  // Find selected category object
  const selectedCategory = categories.find(cat => cat._id === form.category);
  if (!open) return null;
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{marginBottom:16}}>{initial? 'Update Product':'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} name="name" value={form.name||''} onChange={handleChange} required />
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select style={{...inputStyle, margin:0}} name="category" value={form.category||''} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" style={{...btnStyle, background:'#e5e7eb', color:'#222', padding:'6px 12px', fontSize:14}} onClick={()=>setShowAddCat(v=>!v)}>+ Add New</button>
          </div>
          {showAddCat && (
            <div style={{ margin: '8px 0 0 0', display:'flex', gap:8 }}>
              <input style={{...inputStyle, margin:0, flex:1}} value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="New category name" required />
              <button type="button" style={{...btnStyle, background:'#fb7185', color:'white', padding:'6px 14px', fontSize:14}} onClick={handleAddCategory}>Add</button>
            </div>
          )}
          {catMsg && <div style={{color:'#22c55e', fontWeight:600, margin:'4px 0 8px 0'}}>{catMsg}</div>}
          <label style={labelStyle}>Subcategory</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              style={{...inputStyle, margin:0, flex:1}}
              name="subcategory"
              value={form.subcategory || ''}
              onChange={handleChange}
              disabled={!selectedCategory || !selectedCategory.subcategories || selectedCategory.subcategories.length === 0}
              required
            >
              <option value="">{selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? 'Select subcategory' : 'No subcategories available'}</option>
              {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.map((subcat, idx) => (
                <option key={idx} value={subcat}>{subcat}</option>
              ))}
            </select>
            <button type="button" style={{...btnStyle, background:'#e5e7eb', color:'#222', padding:'6px 12px', fontSize:14}} onClick={()=>setShowAddSubcat(v=>!v)}>+ Add New</button>
          </div>
          {showAddSubcat && (
            <div style={{ margin: '8px 0 0 0', display:'flex', gap:8 }}>
              <input style={{...inputStyle, margin:0, flex:1}} value={newSubcatName} onChange={e=>setNewSubcatName(e.target.value)} placeholder="New subcategory name" required />
              <button type="button" style={{...btnStyle, background:'#fb7185', color:'white', padding:'6px 14px', fontSize:14}} onClick={handleAddSubcategory}>Add</button>
            </div>
          )}
          {subcatMsg && <div style={{color:'#22c55e', fontWeight:600, margin:'4px 0 8px 0'}}>{subcatMsg}</div>}
          <label style={labelStyle}>Brand</label>
          <input style={inputStyle} name="brand" value={form.brand||''} onChange={handleChange} />
          <label style={labelStyle}>Price</label>
          <input style={inputStyle} name="price" type="number" value={form.price||''} onChange={handleChange} required min={0} />
          <label style={labelStyle}>Stock</label>
          <input style={inputStyle} name="stock" type="number" value={form.stock||''} onChange={handleChange} required min={0} />
          <label style={labelStyle}>Discount %</label>
          <input style={inputStyle} name="discountPercentage" type="number" value={form.discountPercentage||0} onChange={handleChange} min={0} max={100} />
          <label style={labelStyle}>Image</label>
          <input style={inputStyle} name="image" type="file" accept="image/*" onChange={handleFile} />
          <div style={{marginTop:16}}>
            <button type="submit" style={{...btnStyle, background:'#fb7185', color:'white'}}>{initial?'Update':'Add'}</button>
            <button type="button" style={{...btnStyle, background:'#e5e7eb', color:'#222'}} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacists, setPharmacists] = useState([]);
  const [locationError, setLocationError] = useState('');
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setLocationError('');
    if (user && user.role === 'pharmacist') {
      // Pharmacist: show only their own products
      getPharmacistProducts()
        .then(data => {
          setProducts(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setProducts([]);
          setLoading(false);
        });
      return;
    }
    // Only auto-fetch for non-pharmacist users
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch products and medicines from all nearby pharmacists (within 5km)
        const results = await getNearbyProductsAndMedicines(latitude, longitude);
        if (!results.length) {
          setProducts([]);
          setError('No pharmacist is currently online in your area.');
          setLoading(false);
          return;
        }
        // Flatten all products from all pharmacists, and add pharmacistName
        let allProducts = [];
        for (const entry of results) {
          const pharmacistName = entry.pharmacist.pharmacyName || 'Pharmacist';
          allProducts = allProducts.concat(
            (entry.products || []).map(p => ({ ...p, pharmacistName }))
          );
        }
        setProducts(allProducts);
        setLoading(false);
      } catch (e) {
        setError('Failed to load products for your area.');
        setProducts([]);
        setLoading(false);
      }
    }, (err) => {
      setLocationError('Location permission denied or unavailable.');
      setLoading(false);
    });
  }, [user]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 15;

  // Pagination logic
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  async function handleAddOrUpdate(data) {
    try {
      if (editProduct) {
        await updateProduct(editProduct._id, data);
        setActionMsg('Product updated successfully!');
      } else {
        await addProduct(data);
        setActionMsg('Product added successfully!');
      }
      setModalOpen(false);
      setEditProduct(null);
      // Refresh products
      setLoading(true);
      const dataNew = user && user.role === 'pharmacist' ? await getPharmacistProducts() : await getAllProducts();
      setProducts(Array.isArray(dataNew) ? dataNew : []);
      setLoading(false);
      setTimeout(()=>setActionMsg(''), 2000);
    } catch (e) {
      setActionMsg(e.message || 'Action failed');
    }
  }

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
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#fb7185' }}>All Products</h1>
      <p style={{ fontSize: 17, color: '#555', marginBottom: 24 }}>View and manage all products in your inventory</p>
      {user && user.role === 'pharmacist' && (
        <button style={{...btnStyle, background:'#fb7185', color:'white', marginBottom:16}} onClick={()=>{setEditProduct(null);setModalOpen(true);}}>+ Add New Product</button>
      )}
      {actionMsg && <div style={{marginBottom:12, color:'#22c55e', fontWeight:600}}>{actionMsg}</div>}
      {locationError && <div style={{ color: '#e53935', marginBottom: 16 }}>{locationError}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>Loading products...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#e53935' }}>{error}</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#666' }}>No products available from nearby pharmacists.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Subcategory</th>
                <th style={thStyle}>Brand</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Discount %</th>
                <th style={thStyle}>Discounted Price</th>
                <th style={thStyle}>Created At</th>
                <th style={thStyle}>Updated At</th>
                {user && user.role === 'pharmacist' && <th style={thStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(prod => (
                <tr key={prod._id}>
                  <td style={tdStyle}>{prod.image ? <img src={prod.image} alt={prod.name} style={imgStyle} /> : '-'}</td>
                  <td style={tdStyle}>{prod.name}</td>
                  <td style={tdStyle}>{prod.category?.name || prod.category || '-'}</td>
                  <td style={tdStyle}>{prod.subcategory || '-'}</td>
                  <td style={tdStyle}>{prod.brand || '-'}</td>
                  <td style={tdStyle}>₹{prod.price}</td>
                  <td style={tdStyle}>{prod.stock}</td>
                  <td style={tdStyle}>{prod.discountPercentage || 0}%</td>
                  <td style={tdStyle}>₹{prod.discountedPrice || (prod.price * (1 - (prod.discountPercentage || 0) / 100)).toFixed(2)}</td>
                  <td style={tdStyle}>{prod.createdAt ? new Date(prod.createdAt).toLocaleString() : '-'}</td>
                  <td style={tdStyle}>{prod.updatedAt ? new Date(prod.updatedAt).toLocaleString() : '-'}</td>
                  {user && user.role === 'pharmacist' && (
                    <td style={tdStyle}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton size="small" color="error" onClick={async () => {
                          if (window.confirm('Delete this product?')) {
                            await deleteProduct(prod._id);
                            const dataNew = user && user.role === 'pharmacist' ? await getPharmacistProducts() : await getAllProducts();
                            setProducts(Array.isArray(dataNew) ? dataNew : []);
                          }
                        }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <button style={{...btnStyle, background:'#fbbf24', color:'#222', padding:'6px 14px', fontSize:14, marginRight:0}} onClick={()=>{setEditProduct(prod);setModalOpen(true);}}>Edit</button>
                      </Box>
                    </td>
                  )}
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
                    background: currentPage === idx + 1 ? '#fb7185' : '#e5e7eb',
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
      {user && user.role === 'pharmacist' && (
        <ProductFormModal open={modalOpen} onClose={()=>{setModalOpen(false);setEditProduct(null);}} onSubmit={handleAddOrUpdate} initial={editProduct} />
      )}
    </div>
  );
};

export default Products;
