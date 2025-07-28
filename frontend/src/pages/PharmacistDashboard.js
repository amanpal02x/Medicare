import React, { useEffect, useState } from 'react';
import { getAllMedicines, getPharmacistMedicines } from '../services/medicines';
import { getAllProducts, getPharmacistProducts } from '../services/products';
import { getAllSales } from '../services/sales';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BusinessIcon from '@mui/icons-material/Business';
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Chip, Grid, Card, CardContent, CardHeader, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { getPharmacistProfile } from '../services/pharmacist';
import { Link as RouterLink } from 'react-router-dom';

const socket = io('https://medicare-ydw4.onrender.com');

const cardStyle = {
  borderRadius: '20px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
  padding: '24px',
  margin: '20px',
  width: '100%',
  maxWidth: '500px',
  background: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const statBoxStyle = {
  display: 'flex',
  gap: '16px',
  marginBottom: '16px',
};

const statStyle = {
  background: '#f5f5f5',
  borderRadius: '10px',
  padding: '12px 20px',
  minWidth: '80px',
  textAlign: 'center',
  fontWeight: 'bold',
};

const actionsStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px',
};

const widgetStyle = {
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  padding: 24,
  margin: '20px 0',
  maxWidth: 1100,
  width: '100%',
};

const fadeIn = {
  animation: 'fadeIn 0.8s',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
};

const cardHover = {
  transition: 'box-shadow 0.3s, transform 0.3s',
  '&:hover': {
    boxShadow: 8,
    transform: 'translateY(-4px) scale(1.03)',
  },
};

const widgetBg = {
  background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
  borderRadius: 4,
  p: { xs: 2, md: 4 },
  mb: 4,
  boxShadow: 1,
};

const COLORS_MED = ['#22c55e', '#f59e42', '#ef4444', '#fbbf24'];
const COLORS_PROD = ['#2563eb', '#f59e42', '#ef4444'];

const statIcons = {
  medicines: <LocalPharmacyIcon fontSize="large" color="primary" />,
  products: <Inventory2Icon fontSize="large" color="secondary" />,
  sales: <TrendingUpIcon fontSize="large" color="success" />,
  revenue: <MonetizationOnIcon fontSize="large" sx={{ color: '#f59e42' }} />,
  warning: <WarningAmberIcon fontSize="large" color="warning" />,
};

function getMedicineStats(medicines) {
  const now = new Date();
  let total = medicines.length;
  let expiring = 0;
  let outOfStock = 0;
  let lowStock = 0;
  let inStock = 0;
  medicines.forEach(med => {
    if (med.stock === 0) outOfStock++;
    else if (med.stock <= 5) lowStock++;
    else inStock++;
    if (med.expiryDate && new Date(med.expiryDate) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) expiring++;
  });
  return { total, expiring, outOfStock, lowStock, inStock };
}

function getProductStats(products) {
  let total = products.length;
  let outOfStock = 0;
  let lowStock = 0;
  let inStock = 0;
  products.forEach(prod => {
    if (prod.stock === 0) outOfStock++;
    else if (prod.stock <= 5) lowStock++;
    else inStock++;
  });
  return { total, outOfStock, lowStock, inStock };
}

const API_BASE = (process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api').replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}

async function fetchOrders() {
  const token = localStorage.getItem('token');
  const res = await fetch(joinUrl(API_BASE, '/pharmacist/orders'), {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

// Add a helper for the stacked center column
const StackedCenter = ({ top, bottom }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'center' }}>
    <Box width="100%">{top}</Box>
    <Box width="100%">{bottom}</Box>
  </Box>
);

// Utility to convert array of objects to CSV
function arrayToCSV(data, columns) {
  const header = columns.map(col => col.label).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      let val = typeof col.value === 'function' ? col.value(row) : row[col.value];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

const PharmacistDashboard = () => {
  const [medicineStats, setMedicineStats] = useState({ total: '--', expiring: '--', outOfStock: '--', lowStock: '--', inStock: '--' });
  const [productStats, setProductStats] = useState({ total: '--', outOfStock: '--', lowStock: '--', inStock: '--' });
  const [medicines, setMedicines] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearAllNotifications } = useNotifications();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  const handleNotifOpen = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => { setProfileAnchor(null); logout(); };
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [savedCoords, setSavedCoords] = useState(null);
  const [pharmacyName, setPharmacyName] = useState('');

  // Fetch pharmacist profile for address and coordinates
  useEffect(() => {
    getPharmacistProfile().then(profile => {
      setSavedAddress(profile.address || '');
      setPharmacyName(profile.pharmacyName || '');
      if (profile.location && Array.isArray(profile.location.coordinates)) {
        setSavedCoords(profile.location.coordinates);
      }
      if (typeof profile.online === 'boolean') {
        setOnline(profile.online);
      }
    });
  }, []);

  // Fetch current location when pharmacist is online on page load
  useEffect(() => {
    if (online && !location) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation([lat, lng]);
        },
        (err) => {
          setLocationError('Unable to get current location');
          setLocationLoading(false);
        }
      );
    }
  }, [online, location]);

  // Fetch pharmacist profile for online status and location (optional: can be from context or API)
  useEffect(() => {
    // Optionally fetch initial status/location from backend
  }, []);

  // Toggle online/offline and update location
  const handleToggleOnline = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation([lat, lng]);
        fetch(`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api'}/pharmacist/location`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ lat, lng, online: !online })
        })
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(() => {
            setOnline(!online);
            setLocationLoading(false);
            socket.emit('pharmacist-location-update', {
              pharmacistId: user?._id,
              lat,
              lng,
              online: !online
            });
          })
          .catch(err => {
            setLocationLoading(false);
            setLocationError(err.message || 'Failed to update location');
          });
      },
      () => setLocationLoading(false)
    );
  };

  // Fetch address when location changes
  useEffect(() => {
    if (location && location.length === 2) {
      const [lat, lng] = location;
      setLocationLoading(true);
      setLocationError('');
      axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => {
          setLocationName(res.data.display_name || '');
        })
        .catch((err) => {
          setLocationName('');
          setLocationError('Unable to determine address for your current location.');
        })
        .finally(() => setLocationLoading(false));
    }
  }, [location]);

  // Custom icon for pharmacist
  const pharmacistIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [medicinesData, productsData, ordersData, salesData] = await Promise.all([
          getPharmacistMedicines(),
          getPharmacistProducts(),
          fetchOrders(),
          getAllSales()
        ]);
        setMedicines(medicinesData);
        setProducts(productsData);
        setOrders(ordersData);
        setSales(salesData);
        setMedicineStats(getMedicineStats(medicinesData));
        setProductStats(getProductStats(productsData));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Widget Data
  const lowStockItems = [
    ...medicines.filter(m => m.stock <= 5),
    ...products.filter(p => p.stock <= 5)
  ];
  const expiringSoon = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  // Filter delivered orders assigned to this pharmacist
  const pharmacistId = user?.id;
  const deliveredOrders = orders.filter(
    order =>
      order.status === 'delivered' &&
      order.pharmacist &&
      (
        (order.pharmacist._id && order.pharmacist._id === pharmacistId) ||
        order.pharmacist === pharmacistId
      )
  );
  const recentOrders = deliveredOrders.slice(0, 5);
  // Calculate total sales and revenue from delivered orders
  const totalSales = deliveredOrders.length;
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Calculate total quantity for medicines and products
  const totalMedicineQuantity = medicines.reduce((sum, med) => sum + (med.stock || 0), 0);
  const totalProductQuantity = products.reduce((sum, prod) => sum + (prod.stock || 0), 0);

  const medicineChartData = [
    { name: 'In Stock', value: medicineStats.inStock },
    { name: 'Low Stock', value: medicineStats.lowStock },
    { name: 'Out of Stock', value: medicineStats.outOfStock },
    { name: 'Expiring Soon', value: medicineStats.expiring },
  ];
  const productChartData = [
    { name: 'In Stock', value: productStats.inStock },
    { name: 'Low Stock', value: productStats.lowStock },
    { name: 'Out of Stock', value: productStats.outOfStock },
  ];

  // CSV columns for Recent Orders
  const recentOrdersColumns = [
    { label: 'Order ID', value: row => `#${row._id.slice(-6)}` },
    { label: 'Customer', value: row => row.user?.name || 'N/A' },
    { label: 'Status', value: row => row.status },
    { label: 'Total', value: row => row.total || '-' },
  ];
  // CSV columns for Expiring Soon
  const expiringSoonColumns = [
    { label: 'Medicine', value: row => row.name },
    { label: 'Expiry', value: row => new Date(row.expiryDate).toLocaleDateString() },
    { label: 'Stock', value: row => row.stock },
  ];

  // Download handlers
  const handleDownloadCSV = (data, columns, filename) => {
    const csv = arrayToCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: '25px', backgroundColor: 'white' }}>
      {/* Hero Section */}
      <Box sx={{ ...widgetBg, mb: 6, mt: 2, ...fadeIn }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Welcome{user && user.name ? `, ${user.name}` : ''}!
            </Typography>
            {pharmacyName && (
              <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                {pharmacyName}
              </Typography>
            )}
            {/* Current Location Display - Show when online */}
            {online && (
              <>
                {locationLoading && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 Fetching your current address...
                  </Typography>
                )}
                {locationError && !locationLoading && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    📍 {locationError}
                  </Typography>
                )}
                {locationName && !locationLoading && !locationError && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 Current Location: {locationName}
                  </Typography>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip 
                icon={statIcons.medicines} 
                label={`Medicines: ${medicineStats.total}`} 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  '& .MuiChip-icon': {
                    color: 'primary.main'
                  }
                }}
              />
              <Chip 
                icon={statIcons.products} 
                label={`Products: ${productStats.total}`} 
                color="secondary" 
                variant="outlined" 
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    color: 'secondary.main',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  '& .MuiChip-icon': {
                    color: 'secondary.main'
                  }
                }}
              />
              <Chip 
                icon={statIcons.sales} 
                label={`Sales: ${sales.length}`} 
                color="success" 
                variant="outlined" 
                sx={{ 
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    color: 'success.main',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  '& .MuiChip-icon': {
                    color: 'success.main'
                  }
                }}
              />
              <Chip 
                icon={statIcons.revenue} 
                label={`Revenue: ₹${totalRevenue.toFixed(2)}`} 
                sx={{ 
                  bgcolor: '#fbbf24', 
                  color: '#fff',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  '& .MuiChip-icon': {
                    color: '#fff'
                  }
                }} 
              />
              <Button
                variant={online ? 'contained' : 'outlined'}
                color={online ? 'success' : 'primary'}
                onClick={handleToggleOnline}
                disabled={locationLoading}
                sx={{ ml: 1, height: 40 }}
              >
                {online ? 'Go Offline' : 'Go Online'}
              </Button>
              {/* Location display right of Go Online button - only show when offline */}
              {!online && (
                <Box sx={{ ml: 2, minWidth: 180, display: 'inline-block', verticalAlign: 'middle' }}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    <span role="img" aria-label="location">📍</span> Location:
                  </Typography>
                  {savedAddress && (
                    <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                      {savedAddress}
                    </Typography>
                  )}
                  {!savedAddress && (
                    <Typography variant="caption" color="text.secondary">No location set</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton color="primary" onClick={handleNotifOpen}>
                <Badge color="error" badgeContent={notifications.filter(n => !n.isRead).length}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
              {notifications.length === 0 ? (
                <MenuItem disabled>No notifications</MenuItem>
              ) : (
                <>
                  <MenuItem disabled>Notifications ({notifications.length})</MenuItem>
                  <MenuItem onClick={clearAllNotifications}>Clear All</MenuItem>
                  <Divider />
                  {notifications.map(n => (
                    <MenuItem key={n._id} onClick={handleNotifClose} style={{ fontWeight: n.isRead ? 400 : 700 }}>
                      {n.message}
                    </MenuItem>
                  ))}
                </>
              )}
            </Menu>
            <Tooltip title={user?.name || 'Profile'}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, cursor: 'pointer', fontSize: 24 }} onClick={handleProfileOpen}>
                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
              </Avatar>
            </Tooltip>
            <Popover open={Boolean(profileAnchor)} anchorEl={profileAnchor} onClose={handleProfileClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1} p={2} minWidth={220}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', color: '#fff', fontSize: 32 }}>{user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}</Avatar>
                <Typography variant="h6" fontWeight={700} color="primary.main">Profile</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/pharmacist/profile"
                    size="small"
                    sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: 13 }}
                    color="primary"
                  >
                    View Full
                  </Button>
                </Typography>
                <Box width="100%" mt={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}><PersonIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Name:</b> {user?.name}</Typography></Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}><MailOutlineIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Email:</b> {user?.email}</Typography></Box>
                  {pharmacyName && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}><BusinessIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Pharmacy:</b> {pharmacyName}</Typography></Box>
                  )}
                  <Box display="flex" alignItems="center" gap={1}><AssignmentIcon color="primary" fontSize="small" /><Typography variant="body2"><b>Role:</b> {user?.role}</Typography></Box>
                </Box>
                <Divider sx={{ my: 1, width: '100%' }} />
                <Button variant="contained" color="primary" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>LOGOUT</Button>
              </Box>
            </Popover>
          </Box>
        </Box>
      </Box>

      {/* First Row: Product | Center (stacked) | Medicine */}
      <Paper elevation={6} sx={{ p: 4, borderRadius: 5, mb: 4, background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Product Stock Widget */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #ffb6b9 0%, #fa709a 100%)', color: 'white', minHeight: 320, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {statIcons.products}
                <Typography variant="h6" fontWeight={700}>Product Stock</Typography>
              </Box>
              <Box sx={{ position: 'relative', width: 180, height: 180, mb: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {productChartData.map((entry, idx) => (
                        <Cell key={`cell-prod-${idx}`} fill={COLORS_PROD[idx % COLORS_PROD.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Typography variant="h5" fontWeight={700}>{totalProductQuantity}</Typography>
                  <Typography variant="caption">Total</Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 1, 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                '& .stat-item': {
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontWeight: 500,
                  fontSize: '13px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(5px)',
                  minWidth: '50px',
                  textAlign: 'center'
                }
              }}>
                <span className="stat-item" style={{ color: '#2563eb', borderColor: '#2563eb' }}>
                  In: {productStats.inStock}
                </span>
                <span className="stat-item" style={{ color: '#f59e42', borderColor: '#f59e42' }}>
                  Low: {productStats.lowStock}
                </span>
                <span className="stat-item" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                  Out: {productStats.outOfStock}
                </span>
              </Box>
              <Box display="flex" gap={2} mt={2}>
                <Button variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/products?add=true')}>+ ADD</Button>
                <Button variant="outlined" color="secondary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/products')}>MANAGE</Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sales Summary Widget */}
          <Grid item xs={12} md={2}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #fffbe6 0%, #ffe066 100%)', color: '#333', minHeight: 320, minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <MonetizationOnIcon sx={{ color: '#f59e42' }} />
                <Typography variant="h6" fontWeight={700}>Sales Summary</Typography>
              </Box>
              <Box sx={{ width: 120, height: 120, position: 'relative', mb: 1 }}>
                <CircularProgress variant="determinate" value={Math.min((totalRevenue / 100000) * 100, 100)} size={120} thickness={5} sx={{ color: '#f59e42', background: '#fffde7', borderRadius: '50%' }} />
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Typography variant="h5" fontWeight={700}>₹{totalRevenue.toLocaleString()}</Typography>
                  <Typography variant="caption">Revenue</Typography>
                </Box>
              </Box>
              <Typography fontSize={15}>Total Sales: <b>{totalSales}</b></Typography>
              <Typography fontSize={12} color="text.secondary" sx={{ mt: 1 }}>Target: ₹1,00,000</Typography>
            </Paper>
          </Grid>

          {/* Medicine Stock Widget */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #a1c4fd 0%, #6a89cc 100%)', color: 'white', minHeight: 320, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {statIcons.medicines}
                <Typography variant="h6" fontWeight={700}>Medicine Stock</Typography>
              </Box>
              <Box sx={{ position: 'relative', width: 180, height: 180, mb: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={medicineChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {medicineChartData.map((entry, idx) => (
                        <Cell key={`cell-med-${idx}`} fill={COLORS_MED[idx % COLORS_MED.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Typography variant="h5" fontWeight={700}>{totalMedicineQuantity}</Typography>
                  <Typography variant="caption">Total</Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 1, 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                '& .stat-item': {
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontWeight: 500,
                  fontSize: '13px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(5px)',
                  minWidth: '50px',
                  textAlign: 'center'
                }
              }}>
                <span className="stat-item" style={{ color: '#22c55e', borderColor: '#22c55e' }}>
                  In: {medicineStats.inStock}
                </span>
                <span className="stat-item" style={{ color: '#f59e42', borderColor: '#f59e42' }}>
                  Low: {medicineStats.lowStock}
                </span>
                <span className="stat-item" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                  Out: {medicineStats.outOfStock}
                </span>
                <span className="stat-item" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>
                  Expiring: {medicineStats.expiring}
                </span>
              </Box>
              <Box display="flex" gap={2} mt={2}>
                <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/medicines?add=true')}>+ ADD</Button>
                <Button variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/medicines')}>MANAGE</Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      {/* Second Row: Recent Orders | Expiring Soon (Excel-like tables) */}
      {/* Recent Orders and Expiring Soon Section */}
      <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
        {/* Recent Orders Card */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: 'fit-content',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)'
              }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    p: 1,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <AssignmentIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Recent Orders</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Latest delivered orders</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadCSV(recentOrders, recentOrdersColumns, 'recent_orders.csv')}
                  sx={{ 
                    fontWeight: 600, 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  DOWNLOAD CSV
                </Button>
              </Box>
            </Box>
            
            {/* Content */}
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {recentOrders.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  color: 'text.secondary',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: 3,
                  mx: 1
                }}>
                  <Box sx={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#667eea' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} mb={1} color="text.primary">No Recent Orders</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 200, mx: 'auto' }}>
                    Orders will appear here once they are delivered
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f5f9',
                    borderRadius: '3px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#cbd5e1',
                    borderRadius: '3px',
                    '&:hover': {
                      background: '#94a3b8'
                    }
                  }
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        '& th': {
                          borderBottom: '2px solid #e2e8f0',
                          fontWeight: 700,
                          color: '#475569',
                          fontSize: '0.875rem'
                        }
                      }}>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order, index) => (
                        <TableRow 
                          key={order._id} 
                          hover 
                          sx={{ 
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              background: 'rgba(248, 250, 252, 0.5)'
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            color: '#667eea', 
                            fontWeight: 600, 
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                          }}>
                            #{order.orderNumber || order._id?.slice(-6)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 500,
                            color: '#374151'
                          }}>
                            {order.user?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status} 
                              size="small" 
                              color={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'} 
                              sx={{ 
                                fontWeight: 700, 
                                textTransform: 'capitalize',
                                borderRadius: 2,
                                minWidth: 80,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: '#059669',
                            fontSize: '0.875rem'
                          }}>
                            ₹{order.total || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Expiring Soon Card */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              height: 'fit-content',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)'
              }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    p: 1,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <WarningAmberIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Expiring Soon</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Medicines expiring within 30 days</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadCSV(expiringSoon, expiringSoonColumns, 'expiring_soon.csv')}
                  sx={{ 
                    fontWeight: 600, 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  DOWNLOAD CSV
                </Button>
              </Box>
            </Box>
            
            {/* Content */}
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {expiringSoon.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  color: 'text.secondary',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderRadius: 3,
                  mx: 1
                }}>
                  <Box sx={{
                    background: 'rgba(240, 147, 251, 0.1)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}>
                    <WarningAmberIcon sx={{ fontSize: 40, color: '#f093fb' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} mb={1} color="text.primary">No Expiring Medicines</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 200, mx: 'auto' }}>
                    Medicines expiring within 30 days will appear here
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f5f9',
                    borderRadius: '3px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#cbd5e1',
                    borderRadius: '3px',
                    '&:hover': {
                      background: '#94a3b8'
                    }
                  }
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                        '& th': {
                          borderBottom: '2px solid #fecaca',
                          fontWeight: 700,
                          color: '#991b1b',
                          fontSize: '0.875rem'
                        }
                      }}>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Expiry</TableCell>
                        <TableCell>Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiringSoon.map((med, index) => (
                        <TableRow 
                          key={med._id} 
                          hover 
                          sx={{ 
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              background: 'rgba(254, 242, 242, 0.5)'
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            fontWeight: 600,
                            color: '#374151',
                            fontSize: '0.875rem',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {med.name}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={new Date(med.expiryDate).toLocaleDateString()} 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 2,
                                borderColor: '#f59e42',
                                color: '#f59e42',
                                background: 'rgba(245, 158, 66, 0.1)',
                                boxShadow: '0 2px 4px rgba(245, 158, 66, 0.2)'
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={med.stock} 
                              size="small" 
                              color={med.stock <= 5 ? 'error' : 'success'} 
                              sx={{ 
                                fontWeight: 700,
                                borderRadius: 2,
                                minWidth: 50,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {loading && <div style={{textAlign:'center',marginTop:40}}>Loading...</div>}
      {error && <div style={{color:'red',textAlign:'center',marginTop:20}}>{error}</div>}
    </Box>
  );
};

export default PharmacistDashboard;
