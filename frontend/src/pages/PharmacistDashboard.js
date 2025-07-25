import React, { useEffect, useState } from 'react';
import { getAllMedicines } from '../services/medicines';
import { getAllProducts } from '../services/products';
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
import { IconButton, Avatar, Tooltip, Box, Typography, Badge, Button, Chip, Grid, Card, CardContent, CardHeader, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import axios from 'axios';
import { getPharmacistProfile } from '../services/pharmacist';
import { Link as RouterLink } from 'react-router-dom';

const socket = io('http://localhost:5000');

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

async function fetchOrders() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/pharmacist/orders`, {
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

  // Fetch pharmacist profile for address and coordinates
  useEffect(() => {
    getPharmacistProfile().then(profile => {
      setSavedAddress(profile.address || '');
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
        fetch('/api/pharmacist/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ lat, lng, online: !online })
        })
          .then(res => res.json())
          .then(() => {
            setOnline(!online);
            setLocationLoading(false);
            socket.emit('pharmacist-location-update', {
              pharmacistId: user?._id,
              lat,
              lng,
              online: !online
            });
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
          getAllMedicines(),
          getAllProducts(),
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
              <Chip icon={statIcons.medicines} label={`Medicines: ${medicineStats.total}`} color="primary" variant="outlined" />
              <Chip icon={statIcons.products} label={`Products: ${productStats.total}`} color="secondary" variant="outlined" />
              <Chip icon={statIcons.sales} label={`Sales: ${sales.length}`} color="success" variant="outlined" />
              <Chip icon={statIcons.revenue} label={`Revenue: ₹${totalRevenue.toFixed(2)}`} sx={{ bgcolor: '#fbbf24', color: '#fff' }} />
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
      <Grid container spacing={4} sx={{ mb: 4, alignItems: 'stretch' }}>
        {/* Product Stock (Left) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffb6b9 0%, #fa709a 100%)', color: 'white', borderRadius: '20px', boxShadow: 6, minHeight: 380, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {statIcons.products}
              <Typography variant="h6" fontWeight={700}>Product Stock</Typography>
            </Box>
            <Box display="flex" gap={1} mb={2}>
              <Chip label={`Total: ${totalProductQuantity}`} color="secondary" />
              <Chip label={`Out: ${productStats.outOfStock}`} color="error" />
              <Chip label={`Low: ${productStats.lowStock}`} sx={{ bgcolor: '#fbbf24', color: '#fff' }} />
            </Box>
            <Box sx={{ width: 300, height: 180, background: 'white', borderRadius: 3, color: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: 1 }}>
              <b>Stock Distribution</b>
              <Box sx={{ width: 120, height: 120, my: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      fill="#8884d8"
                      label
                    >
                      {productChartData.map((entry, idx) => (
                        <Cell key={`cell-prod-${idx}`} fill={COLORS_PROD[idx % COLORS_PROD.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box fontSize={13} mt={1}>
                <span style={{ color: '#2563eb' }}>In Stock: {productStats.inStock}</span> &nbsp;
                <span style={{ color: '#f59e42' }}>Low: {productStats.lowStock}</span> &nbsp;
                <span style={{ color: '#ef4444' }}>Out: {productStats.outOfStock}</span>
              </Box>
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/products?add=true')}>+ ADD</Button>
              <Button variant="outlined" color="secondary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/products')}>MANAGE</Button>
            </Box>
          </Card>
        </Grid>
        {/* Sales Summary (Center) */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #fffbe6 0%, #ffe066 100%)', color: '#333', borderRadius: '20px', boxShadow: 4, minHeight: 160, maxWidth: 320, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, m: '0 auto' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <MonetizationOnIcon sx={{ color: '#f59e42' }} />
              <Typography variant="subtitle1" fontWeight={700}>Sales Summary</Typography>
            </Box>
            <Typography fontSize={15}>Total Sales: <b>{totalSales}</b></Typography>
            <Typography fontSize={15}>Total Revenue: <b>₹{totalRevenue.toFixed(2)}</b></Typography>
            <Typography fontSize={12} color="text.secondary" sx={{ mt: 1 }}>Target: ₹1,00,000</Typography>
          </Card>
        </Grid>
        {/* Medicine Stock (Right) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #a1c4fd 0%, #6a89cc 100%)', color: 'white', borderRadius: '20px', boxShadow: 6, minHeight: 380, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {statIcons.medicines}
              <Typography variant="h6" fontWeight={700}>Medicine Stock</Typography>
            </Box>
            <Box display="flex" gap={1} mb={2}>
              <Chip label={`Total: ${totalMedicineQuantity}`} color="primary" />
              <Chip label={`Expiring: ${medicineStats.expiring}`} color="warning" />
              <Chip label={`Out: ${medicineStats.outOfStock}`} color="error" />
              <Chip label={`Low: ${medicineStats.lowStock}`} sx={{ bgcolor: '#fbbf24', color: '#fff' }} />
            </Box>
            <Box sx={{ width: 300, height: 180, background: 'white', borderRadius: 3, color: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: 1 }}>
              <b>Stock Distribution</b>
              <Box sx={{ width: 160, height: 120, my: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={medicineChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      fill="#8884d8"
                      label
                    >
                      {medicineChartData.map((entry, idx) => (
                        <Cell key={`cell-med-${idx}`} fill={COLORS_MED[idx % COLORS_MED.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box fontSize={13} mt={1}>
                <span style={{ color: '#22c55e' }}>In Stock: {medicineStats.inStock}</span> &nbsp;
                <span style={{ color: '#f59e42' }}>Low: {medicineStats.lowStock}</span> &nbsp;
                <span style={{ color: '#ef4444' }}>Out: {medicineStats.outOfStock}</span> &nbsp;
                <span style={{ color: '#fbbf24' }}>Expiring: {medicineStats.expiring}</span>
              </Box>
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/medicines?add=true')}>+ ADD</Button>
              <Button variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 700, px: 3 }} onClick={() => navigate('/pharmacist/medicines')}>MANAGE</Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
      {/* Second Row: Recent Orders | Expiring Soon (Excel-like tables) */}
      <Grid container spacing={8} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', boxShadow: 3, p: 2, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">Recent Orders</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadCSV(recentOrders, recentOrdersColumns, 'recent_orders.csv')}
                sx={{ fontWeight: 600 }}
              >
                Download CSV
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3, maxHeight: 350, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No recent orders.</TableCell></TableRow>
                  ) : (
                    recentOrders.map(order => (
                      <TableRow key={order._id} hover>
                        <TableCell sx={{ color: 'primary.main', fontWeight: 600 }}>#{order.orderNumber || order._id?.slice(-6)}</TableCell>
                        <TableCell>{order.user?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip label={order.status} size="small" color={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'} sx={{ fontWeight: 700, textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>₹{order.total || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: '20px', boxShadow: 3, p: 2, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">Expiring Soon</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadCSV(expiringSoon, expiringSoonColumns, 'expiring_soon.csv')}
                sx={{ fontWeight: 600 }}
              >
                Download CSV
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 3, maxHeight: 350, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringSoon.length === 0 ? (
                    <TableRow><TableCell colSpan={3}>No medicines expiring soon.</TableCell></TableRow>
                  ) : (
                    expiringSoon.map(med => (
                      <TableRow key={med._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{med.name}</TableCell>
                        <TableCell>{new Date(med.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell>{med.stock}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
      {loading && <div style={{textAlign:'center',marginTop:40}}>Loading...</div>}
      {error && <div style={{color:'red',textAlign:'center',marginTop:20}}>{error}</div>}
    </Box>
  );
};

export default PharmacistDashboard;
